const sql = require('mssql');
const config = require('../config');
const hash = require('../hash/hash');

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

class LoginController {
  async createUser(req, res) {
    const { USER_LOGIN, USER_PASSWORD, USER_ACCESS } = req.query;
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
  }

  async checkPassword(req, res) {
    const { USER_LOGIN, USER_PASSWORD } = req.query;
    const pool = await sql.connect(config);
    const response = await pool
      .request()
      .query(
        `SELECT USER_PASSWORD FROM USERS WHERE USER_LOGIN = '${USER_LOGIN}';`
      );
    let pass = response.recordset[0]?.USER_PASSWORD;
    let checkPass = hash(USER_PASSWORD);
    let id = response.recordset[0]?.ID;
    console.log(checkPass)
      await sleep(2000);

    res.json([{ PASSWORD_CHECK: pass === checkPass, ID: id }]);
    
  }

  async deleteUser(req, res) {
    const { USER_LOGIN } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `DELETE FROM [USERS]
      OUTPUT deleted.USER_LOGIN
      WHERE USER_LOGIN = '${USER_LOGIN}'`
    );
    res.json(response.recordset);
  }

  async updateUserAccess(req, res) {
    const { USER_LOGIN, USER_ACCESS } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `UPDATE [USERS] 
      SET [USER_ACCESS] = '${USER_ACCESS}'
      OUTPUT inserted.USER_LOGIN, inserted.USER_ACCESS 
      WHERE USER_LOGIN = '${USER_LOGIN}'`
    );
    res.json(response.recordset);
  }

  async updateUserPassword(req, res) {
    const { USER_LOGIN, USER_PASSWORD } = req.query;
    const pool = await sql.connect(config);
    const response = await pool.request().query(
      `UPDATE [USERS] 
      SET [USER_PASSWORD] = '${hash(USER_PASSWORD)}'
      OUTPUT inserted.USER_LOGIN
      WHERE USER_LOGIN = '${USER_LOGIN}'`
    );
    res.json(response.recordset);
  }
}

module.exports = new LoginController();
