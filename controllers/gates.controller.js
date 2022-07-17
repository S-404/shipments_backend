const sql = require('mssql');
const config = require('../config');

class GatesController {
    async createGate(req, res, next) {
        try {
            const {GATE} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `INSERT INTO [GATES] ([GATE]) 
                    OUTPUT inserted.* VALUES
                    ('${GATE}')`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }

    }

    async getGates(req, res, next) {
        try {
            const pool = await sql.connect(config);
            const response = await pool.request().query(`SELECT * FROM GATES;`);
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }

    }

    async deleteGate(req, res, next) {
        try {
            const {ID} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `DELETE FROM [GATES]
                  OUTPUT deleted.*
                  WHERE ID = ${ID};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }

    }

    async updateGate(req, res, next) {
        try {
            const {GATE_ID, GATE} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [GATES] 
                  SET [GATE] = '${GATE}'
                  OUTPUT inserted.*
                  WHERE ID = ${GATE_ID};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }

    }
}

module.exports = new GatesController();
