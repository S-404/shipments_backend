const sql = require('mssql');
const config = require('../config');

class GatesController {
  async createGate(req, res) {
    const { GATE } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `INSERT INTO [GATES] ([GATE]) 
      OUTPUT inserted.* VALUES
      ('${GATE}')`
    );
    res.json(response.recordset);
  }

  async getGates(req, res) {
    const pool = await sql.connect(config);
    const response = await pool.request().query(`SELECT * FROM GATES;`);
    res.json(response.recordset);
  }

  async deleteGate(req, res) {
    const { ID } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `DELETE FROM [GATES]
      OUTPUT deleted.*
      WHERE ID = ${ID};`
    );
    res.json(response.recordset);
  }

  async updateGate(req, res) {
    const { GATE_ID, GATE } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `UPDATE [GATES] 
      SET [GATE] = '${GATE}'
      OUTPUT inserted.*
      WHERE ID = ${GATE_ID};`
    );
    res.json(response.recordset);
  }
}

module.exports = new GatesController();
