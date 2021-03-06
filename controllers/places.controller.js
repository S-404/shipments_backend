const sql = require('mssql');
const config = require('../config');

class PlacesController {
    async createPlace(req, res, next) {
        try {
            const {PLACE, GATE_ID} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `INSERT INTO [PLACES] ([GATE_ID], [PLACE], [IS_LOADING]) 
                          OUTPUT inserted.* VALUES
                          (${GATE_ID},'${PLACE}',0)`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async getPlaces(req, res, next) {
        try {
            const pool = await sql.connect(config);
            const response = await pool.request().query(`
                    SELECT 
                      PLACES.*
                    ,otable.MAX_DATE
                    FROM (
                      SELECT PLACES.PLACE, 
                      PLACES.ID, 
                      PLACES.IS_LOADING, 
                      PLACES.LOADING_TIME_HH, 
                      PLACES.LOADING_TIME_MM, 
                      PLACES.TRUCK,
                      GATES.[GATE], 
                      GATES.GATE_ID
                      FROM [PLACES] RIGHT OUTER JOIN 
                      (SELECT [ID] AS GATE_ID, [GATE] FROM GATES) AS GATES
                      ON PLACES.GATE_ID = GATES.GATE_ID
                          ) AS PLACES 
                  LEFT OUTER JOIN (
                        SELECT [PLACE_ID] , max([DATE_ADDED]) as MAX_DATE
                        FROM [ORDERS]
                        GROUP BY [PLACE_ID]) AS otable 
                  ON PLACES.ID = otable.[PLACE_ID]`);
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async updatePlace(req, res, next) {
        try {
            const {PLACE_ID, PLACE} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [PLACES] 
                      SET [PLACE] = '${PLACE}'
                      OUTPUT inserted.*
                      WHERE ID = ${PLACE_ID};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async updatePlaceStatus(req, res, next) {
        try {
            const {ID, IS_LOADING} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [PLACES] 
                      SET [IS_LOADING] = ${IS_LOADING}
                      OUTPUT inserted.*
                      WHERE ID = ${ID};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async updatePlaceLoadingTime(req, res, next) {
        try {
            const {HH, MM, ID} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [PLACES] 
                      SET [LOADING_TIME_HH] = '${HH}',
                      [LOADING_TIME_MM] = '${MM}'
                      OUTPUT inserted.*
                      WHERE ID = ${ID};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async updatePlaceTruck(req, res, next) {
        try {
            const {ID, TRUCK} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [PLACES] 
                      SET [TRUCK] = N'${TRUCK}'
                      OUTPUT inserted.*
                      WHERE ID = ${ID};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async deletePlace(req, res, next) {
        try {
            const {ID} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `DELETE FROM [PLACES]
                  OUTPUT deleted.*
                  WHERE ID = ${ID};`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new PlacesController();
