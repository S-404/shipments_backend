const sql = require('mssql');
const config = require('../config');
const hash = require('../hash/hash');

// function sleep(ms) {
//     return new Promise((resolve) => {
//         setTimeout(resolve, ms);
//     });
// }

class LoginController {
    async createUser(req, res, next) {
        try {
            const {USER_LOGIN, USER_PASSWORD, USER_ACCESS} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `
      IF NOT EXISTS (SELECT * FROM USERS WHERE USER_LOGIN = '${USER_LOGIN}')
      BEGIN
      INSERT INTO [USERS] (USER_LOGIN, USER_PASSWORD, USER_ACCESS) 
      OUTPUT inserted.USER_LOGIN, 'CREATED' AS RESULT VALUES
      ('${USER_LOGIN}','${hash(USER_PASSWORD)}','${USER_ACCESS}')
      END
      ELSE
      SELECT USER_LOGIN, 'ALREADY EXISTS' AS RESULT FROM USERS WHERE USER_LOGIN = '${USER_LOGIN}'
      `
            );
            res.json(response.recordset);

        } catch (e) {
            next(e)
        }
    }

    async checkPassword(req, res, next) {
        try {
            const {USER_LOGIN, USER_PASSWORD} = req.query;
            const pool = await sql.connect(config);
            const response = await pool
                .request()
                .query(
                    `SELECT USER_PASSWORD, USER_ACCESS, ID FROM USERS WHERE USER_LOGIN = '${USER_LOGIN}';`
                );
            let pass = response.recordset[0]?.USER_PASSWORD;
            let checkPass = hash(USER_PASSWORD);
            let id = response.recordset[0]?.ID;
            let access = pass === checkPass ? JSON.parse(response.recordset[0]?.USER_ACCESS) : null
            // await sleep(2000);
            res.json([{
                PASSWORD_CHECK: pass === checkPass,
                ID: id,
                USER_ACCESS: access,
            }]);
        } catch (e) {
            next(e)
        }
    }

    async getUserList(req, res, next) {
        try {
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `SELECT ID, USER_LOGIN,  USER_ACCESS 
              FROM [USERS]
              WHERE USER_LOGIN != 'sa'`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async deleteUser(req, res, next) {
        try {
            const {USER_LOGIN} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `DELETE FROM [USERS]
                OUTPUT deleted.USER_LOGIN
                WHERE USER_LOGIN = '${USER_LOGIN}'`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async updateUserAccess(req, res, next) {
        try {
            const {USER_LOGIN, USER_ACCESS} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [USERS] 
                  SET [USER_ACCESS] = '${USER_ACCESS}'
                  OUTPUT inserted.USER_LOGIN, inserted.USER_ACCESS 
                  WHERE USER_LOGIN = '${USER_LOGIN}'`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }

    async updateUserPassword(req, res, next) {
        try {
            const {USER_LOGIN, USER_PASSWORD} = req.query;
            const pool = await sql.connect(config);
            const response = await pool.request().query(
                `UPDATE [USERS] 
                  SET [USER_PASSWORD] = '${hash(USER_PASSWORD)}'
                  OUTPUT inserted.USER_LOGIN
                  WHERE USER_LOGIN = '${USER_LOGIN}'`
            );
            res.json(response.recordset);
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new LoginController();
