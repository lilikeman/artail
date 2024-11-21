const { getAllQuery } = require('../utils/dbUtils');
const {db} = require('../services/databaseService');

exports.getRankings = async (req, res) => {
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
};
