const { getAllQuery, runQuery } = require('../utils/dbUtils');
const {db} = require('../services/databaseService');

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

        const users = await getAllQuery(db, query, params);

        if (users.length === 0) {
            return res.status(404).json({ status: 404, message: '검색어에 일치하는 유저가 없습니다.' });
        }

        res.json({ status: 200, data: { users } });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
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
