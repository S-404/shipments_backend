const sql = require('mssql');
const config = require('../config');

class OrdersController {
    async createOrders(req, res, next) {
        try {
            const {ORDER_NUM, PLACE_ID, USER_ID} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `INSERT INTO ORDERS_LOG 
                 OUTPUT inserted.*
                 SELECT 
                 GETDATE() AS DATE_,
                           insertedVal.ORDER_NUM,
                           insertedVal.PLACE_ID,
                           insertedVal.DATE_ADDED,
                           '${USER_ID}' as [USER_ID],
                           'add' as CODE,
                           insertedVal.ID as ORDER_ID,
                           insertedVal.POSITION
                           FROM
                           (INSERT INTO [ORDERS] ([ORDER_NUM],[PLACE_ID],[DATE_ADDED],POSITION) 
                           OUTPUT inserted.* VALUES
                           ${ORDER_NUM.split(' ').map(
                             (order, index) => `('${order}',${PLACE_ID}, GETDATE(),
                             ISNULL ((SELECT MAX(POSITION) FROM ORDERS WHERE PLACE_ID = ${PLACE_ID}), 0)+1+${index}
                             )`
       )}) insertedVal`
            );
            if (response?.recordset[0]?.ORDER_NUM) {
                await pool.request().query(
                    `DELETE FROM [DEFERRED_ORDERS]
      WHERE ORDER_NUM IN (
        ${ORDER_NUM.split(' ').join(', ')}
        )`)
            }
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async getOrders(req, res, next) {
        try {
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `SELECT 
              PLACES.PLACE,
              PLACES.ID AS PLACE_ID, 
              PLACES.GATE, 
              PLACES.GATE_ID,
              ORDERS.ORDER_NUM, 
              ORDERS.ID AS ORDER_ID,
                ORDERS.STATUS,
              ORDERS.IS_LOADED,
              ORDERS.IS_INPLACE,
              ORDERS.ORDER_WEIGHT,
              ORDERS.POSITION
              FROM (
                  SELECT PLACES.* ,[GATE] 
                  FROM [PLACES] LEFT OUTER JOIN 
                  (SELECT [ID] AS GATES_GATE_ID, [GATE] FROM GATES) AS GATES
                  ON PLACES.GATE_ID = GATES.GATES_GATE_ID) AS PLACES 
              LEFT OUTER JOIN 
                (SELECT ORDERS.* , ORDERS_STATUSES.STATUS, ORDERS_STATUSES.ORDER_WEIGHT
                 FROM ORDERS LEFT OUTER JOIN 
                    (SELECT [ORDER_NUM], MIN([STATUS]) as STATUS, SUM(WEIGHT) AS ORDER_WEIGHT
                        FROM(
                        SELECT DISTINCT 
                        CAST([ORDER_NUM] AS INT) AS [ORDER_NUM],
                        CAST([WEIGHT] AS FLOAT) AS [WEIGHT],
                        CASE [STATUS]
                        WHEN 'Not Started' THEN 0
                        WHEN 'Picked' THEN 1
                        WHEN 'Completed' THEN 2
                        ELSE 1
                        END
                        AS [STATUS]
                        FROM [ORDERS_STATUSES]) STATUSES
                        GROUP BY [ORDER_NUM]) AS ORDERS_STATUSES
                  ON ORDERS.ORDER_NUM = ORDERS_STATUSES.ORDER_NUM) AS ORDERS 
              ON PLACES.ID = ORDERS.PLACE_ID`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async getDeferredOrders(req, res, next) {
        try {
            const pool = await sql.connect(config);
            const response = await pool
                .request()
                .query(`SELECT * FROM DEFERRED_ORDERS`);
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async getOrderLocation(req, res, next) {
        try {
            const {inputNum} = req.query;
            const {criteria} = req.params;

            const locations = `
                SELECT 
                  PLACES.PLACE,
                  PLACES.GATE, 
                  ORDERS.POSITION,
                  CAST (ORDERS.ORDER_NUM as float) as ORDER_NUM
                  FROM (SELECT PLACES.* ,[GATE] 
                    FROM [PLACES] LEFT OUTER JOIN 
                    (SELECT [ID] AS GATES_GATE_ID, [GATE] FROM GATES) AS GATES
                    ON PLACES.GATE_ID = GATES.GATES_GATE_ID) AS PLACES 
                    LEFT OUTER JOIN 
                    ORDERS 
                    ON PLACES.ID = ORDERS.PLACE_ID
                  WHERE ORDERS.ORDER_NUM is not null`;

            const query =
                criteria === 'order'
                    ? `${locations} AND ORDER_NUM = '${inputNum}'`
                    : `SELECT 
                  PICK_IDs.PICK_ID AS ORDER_NUM,
                  ORDERS_LOCATIONS.GATE,
                  ORDERS_LOCATIONS.PLACE
                  FROM PICK_IDs LEFT OUTER JOIN
                  (${locations}) AS ORDERS_LOCATIONS
                    ON PICK_IDs.ORDER_NUM = ORDERS_LOCATIONS.ORDER_NUM
                    WHERE ORDERS_LOCATIONS.ORDER_NUM is not null
                    AND PICK_IDs.PICK_ID = '${inputNum}'`;

            const pool = await sql.connect(config);
            const response = await pool.request().query(query);
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async updateOrderPickedStatus(req, res, next) {
        try {
            const {ORDER_NUM, IS_INPLACE} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [ORDERS] 
              SET [IS_INPLACE] = ${IS_INPLACE}
              OUTPUT inserted.*
              WHERE ORDER_NUM = ${ORDER_NUM};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async updateOrderLoadingStatus(req, res, next) {
        try {
            const {ID, IS_LOADED} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [ORDERS] 
                  SET [IS_LOADED] = ${IS_LOADED === 'true' ? 1 : 0}
                  OUTPUT inserted.*
                  WHERE ID = ${ID};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async updateOrderPosition(req, res, next) {
        try {
            const {ID, POSITION} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [ORDERS] 
              SET [POSITION] = ${POSITION ? POSITION : 0}
              OUTPUT inserted.*
              WHERE ID = ${ID};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async getOrdersLog(req, res, next) {
        try {
            const {GATE_ID} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `SELECT 
              ORDERS_LOG.ID,
              ORDERS_LOG.DATE_, 
              ORDERS_LOG.ORDER_NUM, 
              ORDERS_LOG.DATE_ADDED, 
              ORDERS_LOG.USER_ID, 
              ORDERS_LOG.CODE, 
              ORDERS_LOG.ORDER_ID, 
              PLACES.PLACE, 
              PLACES.ID AS PLACE_ID, 
              GATES.GATE, 
              GATES.ID AS GATE_ID
              FROM PLACES 
              LEFT OUTER JOIN GATES 
              ON PLACES.GATE_ID = dbo.GATES.ID 
              LEFT OUTER JOIN ORDERS_LOG 
              ON PLACES.ID = ORDERS_LOG.PLACE_ID
              WHERE
              ORDERS_LOG.ID IS NOT NULL
              AND DATE_ > GETDATE()-7
              AND GATES.ID = ${GATE_ID}`
            );

            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async deferOrder(req, res, next) {
        try {
            const {ID, USER_ID} = req.query;
            const pool = await sql.connect(config);
            const deleteResponse = await pool.request().query(
                `INSERT INTO ORDERS_LOG 
                   OUTPUT inserted.*
                   SELECT 
                   GETDATE() AS DATE_,
                   deleted.ORDER_NUM,
                   deleted.PLACE_ID,
                   deleted.DATE_ADDED,
                   '${USER_ID}' as [USER_ID],
                   'defer' as CODE,
                   deleted.ID as ORDER_ID,
                   deleted.POSITION
                   FROM
                      (DELETE FROM [ORDERS]
                      OUTPUT deleted.*
                      WHERE ID = ${ID}) deleted`
            );

            let order = deleteResponse?.recordset[0]?.ORDER_NUM;
            if (order) {
                const response = await pool.request().query(
                    `INSERT INTO DEFERRED_ORDERS (ORDER_NUM)
                     OUTPUT inserted.*
                     VALUES ('${order}')
         `
                );
                res.json(response.recordset);
            } else {
                res.json([]);
            }
        } catch (e) {
            next(e)
        }
    }

    async deleteOrderByOrderID(req, res, next) {
        try {
            const {ID, USER_ID} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `INSERT INTO ORDERS_LOG 
                   OUTPUT inserted.*
                   SELECT 
                   GETDATE() AS DATE_,
                   deleted.ORDER_NUM,
                   deleted.PLACE_ID,
                   deleted.DATE_ADDED,
                   '${USER_ID}' as [USER_ID],
                   'delete' as CODE,
                   deleted.ID as ORDER_ID,
                   deleted.POSITION
                   FROM
                      (DELETE FROM [ORDERS]
                      OUTPUT deleted.*
                      WHERE ID = ${ID}) deleted`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async deleteOrderByPlaceID(req, res, next) {
        try {

            const {PLACE_ID, USER_ID} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `INSERT INTO ORDERS_LOG 
               OUTPUT inserted.*
               SELECT 
               GETDATE() AS DATE_,
               deleted.ORDER_NUM,
               deleted.PLACE_ID,
               deleted.DATE_ADDED,
               '${USER_ID}' as [USER_ID],
               'delete' as CODE,
               deleted.ID as ORDER_ID
               FROM
                  (DELETE FROM [ORDERS]
                  OUTPUT deleted.*
                  WHERE PLACE_ID = ${PLACE_ID}) deleted`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }


}

module.exports = new OrdersController();
