const xlsx = require('xlsx');

function processXlsxData(workbook) {
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(firstSheet);

    const validatedData = data.map(row => {
        if (!row.userId || !row.nickname || !row.level || !row.exp) {
            throw new Error(`Invalid data format: ${JSON.stringify(row)}`);
        }

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

module.exports = {
    processXlsxData
};
