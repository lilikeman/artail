const { getAllQuery, runQuery} = require('../utils/dbUtils');
const { db } = require('../services/databaseService');


// author : 김현수
// edit date : 2024-11-29
// last editor : 김현수
// 아이템 구매
// Desc: 구매자아이디, 아이템아이디를 입력받아 거래소에서 아이템 구매를 처리함, 아이템 구매 시 없는 아이템, 잔액 부족 시 에러값을 돌려줌
// TODO: 1)
exports.purchaseItem = async (req, res) => {
    const { buyerId, itemId } = req.body;
  
    try {
      await runQuery(db, 'BEGIN TRANSACTION');
  
      // 아이템 조회
      const item = await getAllQuery(
        db,
        `SELECT * FROM Items WHERE itemId = ? AND status = 'available'`,
        [itemId]
      );
  
      if (item.length === 0) {
        await runQuery(db, 'ROLLBACK');
        return res.status(404).json({status : 404, message: '구매 불가한 아이템입니다.' });
      }
  
      // 구매자 잔액 확인
      const buyer = await getAllQuery(db, `SELECT * FROM Users WHERE userId = ?`, [buyerId]);
      if (buyer.length === 0 || buyer[0].balance < item[0].price) {
        await runQuery(db, 'ROLLBACK');
        return res.status(400).json({status : 400, message: '잔액이 부족합니다.' });
      }
  
      // 구매자 잔액 차감
      await runQuery(db, `UPDATE Users SET balance = balance - ? WHERE userId = ?`, [
        item[0].price,
        buyerId,
      ]);
  
      // 판매자 잔액 증가
      await runQuery(db, `UPDATE Users SET balance = balance + ? WHERE userId = ?`, [
        item[0].price,
        item[0].sellerId,
      ]);
  
      // 아이템 상태 변경
      await runQuery(db, `UPDATE Items SET status = 'sold' WHERE itemId = ?`, [itemId]);
  
      await runQuery(db, 'COMMIT');
  
      res.status(200).json({status : 200, message: '구매성공' });
    } catch (error) {
      await runQuery(db, 'ROLLBACK');
      res.status(500).json({status : 500, message: '구매에 실패하였습니다.'});
    }
  }
