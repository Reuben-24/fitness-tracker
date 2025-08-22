const db = require("../pool");
const { buildInsertQuery, buildUpdateQuery } = require("./utils");

class User {
  async getById(id) {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  }

  async getByEmail(email) {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }

  async create(data) {
    const { query, values } = buildInsertQuery("users", data);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(id, fields = {}) {
    const { query, values } = buildUpdateQuery("users", id, fields);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new User();
