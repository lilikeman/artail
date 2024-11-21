// author : 김현수
// edit date : 2024-11-22
// last editor : 김현수
// sqlite run실행
function runQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// author : 김현수
// edit date : 2024-11-22
// last editor : 김현수
// sqlite all실행
function getAllQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    runQuery,
    getAllQuery
};
