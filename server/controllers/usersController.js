const { getAllQuery, runQuery } = require('../utils/dbUtils');
const { db } = require('../services/databaseService');

// author : 김현수
// edit date : 2024-11-22
// last editor : 김현수
// 사용자 랭킹 조회
// Desc: keyword(userId 또는 nickname)를 입력하여 사용자정보를 출력, keyward는 완전일치하여야 정보를가져옴
exports.searchUsers = async (req, res) => {
    const { keyword } = req.query;

    try {
        const params = [keyword, keyword];
        const query = `
            SELECT 
                userId, 
                nickname, 
                level, 
                experience,
                balance, 
                createdAt, 
                updatedAt,
                (
                    SELECT COUNT(*) + 1 
                    FROM Users u2 
                    WHERE (u2.level > u1.level OR (u2.level = u1.level AND u2.experience > u1.experience))
                    AND u2.isDeleted = 0
                ) as rank
            FROM Users u1
            WHERE isDeleted = false AND (userId = ? OR nickname = ?)
        `;

        //유저정보조회쿼리 실행
        const users = await getAllQuery(db, query, params);

        if (users.length === 0) {
            return res.status(404).json({ status: 404, message: '검색어에 일치하는 유저가 없습니다.' });
        }

        res.json({ status: 200, data: { users } });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

// author : 김현수
// edit date : 2024-11-22
// last editor : 김현수
// 사용자 삭제
// Desc: userId를 입력하여 해당아이디 정보를 삭제, 삭제는 아이디의 정보(idDeleted)를 갱신
// TODO: 1)삭제된 상태의 계정의 정보를 격리할 테이블 or 다른 DB생성 2)삭제 후 복원(필요 시)관련 필드 추가 3)삭제된 사용자 일정 기간이 지나면 스케쥴러에서 삭제
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        //삭제쿼리 실행
        const result = await runQuery(db, `
            UPDATE Users
            SET isDeleted = true, updatedAt = CURRENT_TIMESTAMP
            WHERE userId = ?
        `, [userId]);

        if (result.changes === 0) {
            return res.status(404).json({ status: 404, message: '변경된 유저가 없습니다.' });
        }

        res.json({ status: 200, message: '정상적으로 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


// author : 김현수
// edit date : 2024-11-29
// last editor : 김현수
// 거래소 계정 정보 조회
// Desc: userId를 입력하여 해당아이디의 경매장에 등록한 아이템의 상태를 조회, 대상 : available(구매가능), sold(팔림), pending(대기)
// TODO: 1)인벤토리개념을 도입하여 연동
exports.searchAuctionHistory = async (req, res) => {
    const { userId } = req.query;

    try {
        const params = [userId];
        const query = `
            SELECT 
                u.userId, 
                u.nickname, 
                u.balance,
                u.createdAt, 
                u.updatedAt,
                COALESCE(
                    json_group_array(
                        CASE 
                            WHEN i.status IN ('available', 'sold', 'pending') THEN
                                json_object(
                                    'itemId', i.itemId,
                                    'name', i.name,
                                    'price', i.price,
                                    'status', i.status
                                )
                        END
                    ), '[]'
                ) AS items
            FROM 
                Users u
            LEFT JOIN 
                Items i ON u.userId = i.sellerId
            WHERE 
                u.isDeleted = false 
                AND u.userId = ?
            GROUP BY 
                u.userId
        `;

        // 유저 정보 조회 쿼리 실행
        const users = await getAllQuery(db, query, params);

        // 유저가 없다면 결과 메시지전달
        if (users.length === 0) {
            return res.json({
                status: 404,
                message : "검색어에 일치하는 유저가 없습니다."
            });
        }

        // 응답 전송
        res.json({
            status: 200,
            data: {
                users: users
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
