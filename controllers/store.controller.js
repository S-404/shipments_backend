const sql = require('mssql');
const config = require('../config');

class StoreController {
  async addOrder(req, res) {
    const { ORDER_NUM, GATE_ID } = req.query;
    const pool = await sql.connect(config);
    const addOrder = await pool.request().query(
      `INSERT INTO [ORDERS] ([ORDER_NUM],[GATE_ID], [DATE_ADDED]) 
        OUTPUT inserted.*
        VALUES ('${ORDER_NUM}',${GATE_ID}, GETDATE());`
    );
    res.json(addOrder.recordset);
  }

  async getOrders(req, res) {
    const pool = await sql.connect(config);
    const getOrders = await pool.request().query(`SELECT * FROM ORDERS;`);
    res.json(getOrders.recordset);
  }

  async getGates(req, res) {
    const pool = await sql.connect(config);
    const getGates = await pool.request().query(`
    SELECT [GATES].[GATE]
    ,[GATES].[PLACE]
    ,[GATES].[ID]
    ,[GATES].[IS_LOADING]
    ,otable.MAX_DATE
    FROM [GATES]
    LEFT OUTER JOIN (
    SELECT [GATE_ID] , max([DATE_ADDED]) as MAX_DATE
    FROM [ORDERS]
    GROUP BY GATE_ID) AS otable ON
    GATES.ID = otable.GATE_ID`);
    res.json(getGates.recordset);
  }

  async getGatesOverview(req, res) {
    const pool = await sql.connect(config);
    const getGatesOverview = await pool.request().query(
      `SELECT GATES.ID AS GATE_ID, GATES.GATE, GATES.PLACE, ORDERS.ORDER_NUM, ORDERS.ID AS ORDER_ID
      FROM GATES LEFT OUTER JOIN
      ORDERS ON GATES.ID = ORDERS.GATE_ID;`
    );
    res.json(getGatesOverview.recordset);
  }

  async deleteOrder(req, res) {
    const { ID } = req.query;
    const pool = await sql.connect(config);
    const deleteOrder = await pool.request().query(
      `DELETE FROM [ORDERS]
      OUTPUT deleted.*
      WHERE ID = ${ID};`
    );
    res.json(deleteOrder.recordset);
  }

  async updateGateStatus(req, res) {
    const { ID } = req.query;
    const pool = await sql.connect(config);
    const updateGate = await pool.request().query(
      `UPDATE [GATES] 
      SET [IS_LOADING] = 1 ^ [IS_LOADING]
      OUTPUT inserted.*
      WHERE ID = ${ID};`
    );
    res.json(updateGate.recordset);
  }

  async deleteGateOrders(req, res) {
    const { GATE_ID } = req.query;
    const pool = await sql.connect(config);
    const deleteGateOrders = await pool.request().query(
      `DELETE FROM [ORDERS]
      OUTPUT deleted.*
      WHERE GATE_ID = ${GATE_ID};`
    );
    res.json(deleteGateOrders.recordset);
  }
}

module.exports = new StoreController();
