const sql = require('mssql');
const config = require('../config');

class OrdersController {
  async createOrders(req, res) {
    const { ORDER_NUM, PLACE_ID } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `INSERT INTO [ORDERS] ([ORDER_NUM],[PLACE_ID],[DATE_ADDED]) 
      OUTPUT inserted.* VALUES
      ${ORDER_NUM.split(' ').map(
        (order) => `('${order}',${PLACE_ID}, GETDATE())`
      )};`
    );
    res.json(response.recordset);
  }

  async getOrders(req, res) {
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `SELECT 
      PLACES.PLACE,
      PLACES.ID AS PLACE_ID, 
      PLACES.GATE, 
      PLACES.GATE_ID,
      ORDERS.ORDER_NUM, 
      ORDERS.ID AS ORDER_ID,
	    ORDERS.STATUS
      FROM (
          SELECT PLACES.* ,[GATE] 
          FROM [PLACES] LEFT OUTER JOIN 
          (SELECT [ID] AS GATES_GATE_ID, [GATE] FROM GATES) AS GATES
          ON PLACES.GATE_ID = GATES.GATES_GATE_ID) AS PLACES 
      LEFT OUTER JOIN 
        (SELECT ORDERS.* , COMPLETED_ORDERS.STATUS
         FROM ORDERS LEFT OUTER JOIN 
            (SELECT ORDER_NUM, 'COMPLETED' AS [STATUS]
            FROM (
                SELECT DISTINCT 
                CAST([ORDER_NUM] AS INT) AS [ORDER_NUM],
                IIF ([STATUS] = 'Completed', 1, 0) AS [STATUS]
                FROM [ORDERS_STATUSES]) STATUSES
            GROUP BY ORDER_NUM
            HAVING COUNT(ORDER_NUM) - SUM([STATUS]) = 0) AS COMPLETED_ORDERS
          ON ORDERS.ORDER_NUM = COMPLETED_ORDERS.ORDER_NUM) AS ORDERS 
      ON PLACES.ID = ORDERS.PLACE_ID`
    );
    res.json(response.recordset);
  }

  async getOneOrder(req, res) {
    const { ORDER_NUM } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `SELECT 
      PLACES.PLACE,
      PLACES.GATE, 
      ORDERS.ORDER_NUM
      FROM (SELECT PLACES.* ,[GATE] 
        FROM [PLACES] LEFT OUTER JOIN 
        (SELECT [ID] AS GATES_GATE_ID, [GATE] FROM GATES) AS GATES
        ON PLACES.GATE_ID = GATES.GATES_GATE_ID) AS PLACES 
        LEFT OUTER JOIN 
        ORDERS 
        ON PLACES.ID = ORDERS.PLACE_ID
      WHERE ORDER_NUM = '${ORDER_NUM}'`
    );
    res.json(response.recordset);
  }

  async deleteOrderByOrderID(req, res) {
    const { ID } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `DELETE FROM [ORDERS]
      OUTPUT deleted.*
      WHERE ID = ${ID};`
    );
    res.json(response.recordset);
  }

  async deleteOrderByPlaceID(req, res) {
    const { PLACE_ID } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `DELETE FROM [ORDERS]
      OUTPUT deleted.*
      WHERE PLACE_ID = ${PLACE_ID};`
    );
    res.json(response.recordset);
  }
}

module.exports = new OrdersController();