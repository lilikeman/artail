const { getAllQuery, runQuery } = require('../utils/dbUtils');
const { db } = require('../services/databaseService');


// author : 김현수
// edit date : 2024-11-29
// last editor : 김현수
// 아이템 거래소 등록
// Desc: 판매자ID, 아이템이름, 가격을 입력하여 거래소에 아이템을 등록
// TODO: 1)인벤토리 개념을 도입하여, 중복된 아이템을 올리는 경우 방지
exports.postItem = async (req, res) => {
    const { sellerId, name, price } = req.body;

    try {
        //아이템 등록
        await runQuery(
            db,
            `INSERT INTO Items (sellerId,name, price, status) VALUES (?, ?, ?, 'available')`,
            [sellerId, name, price]
        );

        res.status(201).json({ status: 201, message: '정상적으로 등록되었습니다.' });
    } catch (error) {
        res.status(500).json({ status: 500, "error": '아이템 등록에 실패하였습니다.' });
    }
}

// author : 김현수
// edit date : 2024-11-29
// last editor : 김현수
// 아이템 거래소 등록된 구매가능 아이템 조회
// Desc: 아이템 거래소에 등록된 구매가능 아이템 조회
// TODO: 1)아이템 개시, 미개시 등 상태값 추가 2)로그인하여 사용시, 본인계정이 등록한 아이템은 제외
exports.getAuctionItem = async (req, res) => {
    try {
        const items = await getAllQuery(
            db,
            `SELECT * FROM Items WHERE status = 'available'`
        );

        res.status(200).json({status :200, items });
    } catch (error) {
        res.status(500).json({ status : 500, message : '아이템 가져오기에 실패하였습니다.'});
    }
}