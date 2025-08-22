const db = require("../pool");
const { buildInsertQuery, buildUpdateQuery } = require("./utils");

class BodyWeight {
  async getAllByUserId(user_id) {
    const result = await db.query(
      "SELECT * FROM body_weights WHERE user_id = $1 ORDER BY recorded_at DESC",
      [user_id]
    );
    return result.rows;
  }

  async getLatestByUserId(user_id) {
    const result = await db.query(
      "SELECT * FROM body_weights WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1",
      [user_id]
    );
    return result.rows[0];
  }

  async create(data) {
    const { query, values } = buildInsertQuery("body_weights", data);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(id, fields = {}) {
    const { query, values } = buildUpdateQuery("body_weights", id, fields);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await db.query(
      "DELETE FROM body_weights WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new BodyWeight();
