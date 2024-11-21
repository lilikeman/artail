const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const xlsxFilePath = 'artail/server/Users.xlsx';
const sqliteFilePath = 'artail/server/database.sqlite';
const path = require('path');
const cors = require('cors');

// Initialize Express app
const app = express();
const port = 3000;
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })); //플러터 웹앱전용
// Set up multer for file upload
const upload = multer({ dest: 'uploads/' });
const db = new sqlite3.Database(
    sqliteFilePath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
    }
);
app.get('/', async (req, res) => {
    await initializeDatabase();
    res.send("data reset");
})


//서버 실행
app.listen(port, () => {
    console.log(`Server is running`);
});

//랭킹 조회 API
app.get('/rankings', async (req, res) => {
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const rankings = await getAllQuery(db, `
            SELECT 
                userId, 
                nickname, 
                level, 
                experience,
                (
                    SELECT COUNT(*) + 1 
                    FROM Users u2 
                    WHERE (u2.level > u1.level OR (u2.level = u1.level AND u2.experience > u1.experience))
                    AND u2.isDeleted = 0
                ) as rank
            FROM Users u1
            WHERE isDeleted = 0
            ORDER BY level DESC, experience DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const totalCount = await getAllQuery(db, `
        SELECT COUNT(*) as count FROM Users WHERE isDeleted = false
      `, []);
        if (rankings.length === 0) {
            return res.status(404).json({ status: 404, message: '랭킹이 정보가 없습니다.' });
        }
        res.json({
            status: 200,
            data: {
                rankings,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount[0].count / limit),
                    totalItems: totalCount[0].count
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
});

//키워드 검색API
app.get('/users/search', async (req, res) => {
    {
        const { keyword, type = 'both' } = req.query;

        try {
            let whereClause = 'WHERE isDeleted = false AND (userId = ? OR nickname = ?)';
            let params = [keyword, keyword];

            const query = `
                SELECT 
                    userId, 
                    nickname, 
                    level, 
                    experience, 
                    createdAt, 
                    updatedAt
                FROM Users
                ${whereClause}
            `;

            const users = await getAllQuery(db, query, params);

            if (users.length === 0) {
                return res.status(404).json({ status: 404, message: '검색어에 일치하는 유저가 없습니다.' });
            }
            res.json({ status: 200, data: { users } });
        } catch (error) {
            res.status(500).json({ status: 500, message: error.message });
        }
    }
});

// 사용자 삭제 API
app.delete('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {

        const result = await runQuery(db, `
        UPDATE Users
        SET isDeleted = true, updatedAt = CURRENT_TIMESTAMP
        WHERE userId = ?
      `, [userId]);
        if (result.changes === 0) { // SQLite에서 변화된 행 수 확인
            return res.status(404).json({ status: 404, message: '변경된 유저가 없습니다.' });
        }
        res.json({ status: 200, message: '정상적으로 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
});

// XLSX 파일 데이터 처리 및 검증 함수
function processXlsxData(workbook) {
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(firstSheet);

    const validatedData = data.map(row => {
        // 필수 필드확인
        if (!row.userId || !row.nickname || !row.level || !row.exp) {
            throw new Error(`Invalid data format: ${JSON.stringify(row)}`);
        }

        // 데이터 타입 검증 및 변환
        return {
            userId: String(row.userId),
            nickname: String(row.nickname),
            level: parseInt(row.level),
            experience: parseInt(row.exp),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false
        };
    });

    return validatedData;
}

// XLSX 파일 to SQLite 변환
async function initializeDatabase() {
    const createDB = new sqlite3.Database(
        sqliteFilePath,
        sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        (err) => {
        }
    );

    await runQuery(createDB, 'PRAGMA foreign_keys = ON');

    // Users 테이블 생성
    await runQuery(createDB, `
            CREATE TABLE IF NOT EXISTS Users (
                userId VARCHAR(16) PRIMARY KEY,
                nickname VARCHAR(100) NOT NULL,
                level INTEGER NOT NULL DEFAULT 1,
                experience BIGINT NOT NULL DEFAULT 0,
                createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                isDeleted BOOLEAN NOT NULL DEFAULT 0,
                CHECK (level >= 1),
                CHECK (experience >= 0)
            )
        `);

    // 인덱스 생성
    await runQuery(createDB, `
            CREATE INDEX IF NOT EXISTS idx_user_ranking 
            ON Users(level DESC, experience DESC)
            WHERE isDeleted = 0
        `);

    await runQuery(createDB, `
            CREATE INDEX IF NOT EXISTS idx_user_search 
            ON Users(userId, nickname)
            WHERE isDeleted = 0
        `);

    // updatedAt을 자동으로 업데이트하는 트리거 생성
    await runQuery(createDB, `
            CREATE TRIGGER IF NOT EXISTS update_user_timestamp
            AFTER UPDATE ON Users
            BEGIN
                UPDATE Users 
                SET updatedAt = CURRENT_TIMESTAMP
                WHERE userId = NEW.userId;
            END
        `);

    console.log('스키마 작성성공');

    // 엑셀 읽기 및 SQLite 저장
    const workbook = xlsx.readFile(xlsxFilePath);

    const usersData = processXlsxData(workbook);

    if (usersData.length === 0) {
        console.error('No data found in the XLSX file.');
        process.exit(1);
    }

    try {
        // 트랜잭션 시작
        await runQuery(createDB, 'BEGIN');

        // 데이터 삽입 쿼리
        const insertQuery = `
          INSERT INTO Users (
            userId, 
            nickname, 
            level, 
            experience, 
            createdAt, 
            updatedAt, 
            isDeleted
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(userId) DO UPDATE SET
            level = excluded.level,
            experience = excluded.experience,
            updatedAt = excluded.updatedAt
        `;

        // 데이터 삽입
        for (const user of usersData) {
            await runQuery(createDB, insertQuery, [
                user.userId,
                user.nickname, // nickname 충돌 무시
                user.level,
                user.experience,
                user.createdAt,
                user.updatedAt,
                user.isDeleted,
            ]);
        }
        // 트랜잭션 커밋
        await runQuery(createDB, 'COMMIT');
        createDB.close();
        console.log('데이터 추가 성공');

    } catch (error) {
        // 트랜잭션 롤백
        await runQuery(createDB, 'ROLLBACK');
        console.error('Error occurred:', error);
    }
}

// 쿼리 실행을 위한 유틸리티 함수
function runQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}
// 데이터 조회를 위한 유틸리티 함수
function getAllQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}