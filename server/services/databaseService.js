const sqlite3 = require('sqlite3');
const sqliteFilePath = '/home/ec2-user/dev/artail/server/database.sqlite';
const xlsxFilePath = '/home/ec2-user/dev/artail/server/Users.xlsx';
const xlsx = require('xlsx');
const { processXlsxData } = require('./xlsxService')
const { getAllQuery, runQuery } = require('../utils/dbUtils');


// author : 김현수
// edit date : 2024-11-22
// last editor : 김현수
// 데이터베이스 객체생성
const db = new sqlite3.Database(
    sqliteFilePath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
    }
);


// author : 김현수
// edit date : 2024-11-28
// last editor : 김현수
// 데이터베이스 작성(초기화)
async function initializeDatabase() {
    await runQuery(db, 'PRAGMA foreign_keys = ON');

    // Users 테이블 생성
    await runQuery(db, `
        CREATE TABLE IF NOT EXISTS Users (
            userId VARCHAR(16) PRIMARY KEY,
            nickname VARCHAR(100) NOT NULL,
            level INTEGER NOT NULL DEFAULT 1,
            experience BIGINT NOT NULL DEFAULT 0,
            balance BIGINT NOT NULL DEFAULT 0,
            createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            isDeleted BOOLEAN NOT NULL DEFAULT 0,
            CHECK (level >= 1),
            CHECK (experience >= 0)
        )
    `);

    // 인덱스 생성
    await runQuery(db, `
        CREATE INDEX IF NOT EXISTS idx_user_ranking 
        ON Users(level DESC, experience DESC)
        WHERE isDeleted = 0
    `);

    await runQuery(db, `
        CREATE INDEX IF NOT EXISTS idx_user_search 
        ON Users(userId, nickname)
        WHERE isDeleted = 0
    `);

    // updatedAt을 자동으로 업데이트하는 트리거 생성
    await runQuery(db, `
        CREATE TRIGGER IF NOT EXISTS update_user_timestamp
        AFTER UPDATE ON Users
        BEGIN
            UPDATE Users 
            SET updatedAt = CURRENT_TIMESTAMP
            WHERE userId = NEW.userId;
        END
    `);

    console.log('Database schema initialized successfully.');

    // 엑셀 읽기 및 SQLite 저장
    const workbook = xlsx.readFile(xlsxFilePath);

    const usersData = processXlsxData(workbook);

    if (usersData.length === 0) {
        console.error('No data found in the XLSX file.');
        process.exit(1);
    }

    try {
        // 트랜잭션 시작
        await runQuery(db, 'BEGIN');

        // 데이터 삽입 쿼리
        const insertQuery = `
            INSERT INTO Users (
                userId, 
                nickname, 
                level, 
                experience,
                balance, 
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
            await runQuery(db, insertQuery, [
                user.userId,
                user.nickname, // nickname 충돌 무시
                user.level,
                user.experience,
                user.balance,
                user.createdAt,
                user.updatedAt,
                user.isDeleted,
            ]);
        }
        // 트랜잭션 커밋
        await runQuery(db, 'COMMIT');
        console.log('Data added successfully.');

    } catch (error) {
        // 트랜잭션 롤백
        await runQuery(db, 'ROLLBACK');
        console.error('Error occurred:', error);
    }
}

module.exports = {
    db,
    initializeDatabase
};
