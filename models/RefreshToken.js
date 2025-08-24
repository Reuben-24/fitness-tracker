const db = require("./pool");

class RefreshToken {
  async save(userId, tokenHash, expiresAt) {
    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  }

  async getAllByUserId(userId) {
    const result = await db.query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  }

  async delete(tokenHash) {
    await db.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [
      tokenHash,
    ]);
  }

  async deleteAllForUser(userId) {
    await db.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
  }
}

module.exports = new RefreshToken();
