const db = require("../db");
const { buildInsertQuery, buildUpdateQuery } = require("../utils");

class MuscleGroup {
  async getById(id) {
    const result = await db.query("SELECT * FROM muscle_groups WHERE id = $1", [id]);
    return result.rows[0];
  }

  async getAllByUserId(user_id) {
    const result = await db.query(
      `
      SELECT * FROM muscle_groups
      WHERE user_id = $1
      ORDER BY created_at DESC;
      `,
      [user_id]
    );

    return result.rows;
  }

  async create(data) {
    const { query, values } = buildInsertQuery("muscle_groups", data);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(id, fields = {}) {
    const { query, values } = buildUpdateQuery("muscle_groups", id, fields);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await db.query(
      "DELETE FROM muscle_groups WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new MuscleGroup();