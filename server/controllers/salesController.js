const { getAllQuery, runQuery } = require('../utils/dbUtils');
const { db } = require('../services/databaseService');

// author : 김현수
// edit date : 2024-11-29
// last editor : 김현수
// 판매 내역 조회
// Desc: userId를 입력하여 해당아이디의 등록 아이템 중 "판매 완료된 아이템"의 정보를 보여줌
// TODO: 1)
exports.getSalesHistory = async(req, res) => {
    const { sellerId } = req.params;

    try {
        const sales = await getAllQuery(
            db,
            `SELECT * FROM Items WHERE sellerId = ? AND status = 'sold'`,
            [sellerId]
        );

        res.status(200).json({ sales });
    } catch (error) {
        res.status(500).json({ status : 500, message: '판매 내역 조회 실패'});
    }
};