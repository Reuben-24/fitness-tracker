const db = require("./pool");
const { buildInsertQuery, buildUpdateQuery } = require("./utils");

class Exercise {
  async getById(id) {
    const result = await db.query("SELECT * FROM exercises WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  async getByIdWithMuscleGroups(id) {
    const exercise = await this.getById(id);
    if (!exercise) return null;

    const muscleGroups = await this.getMuscleGroupsForExercise(id);
    return { ...exercise, muscle_groups: muscleGroups };
  }

  async getAllByUserId(user_id) {
    const result = await db.query(
      "SELECT * FROM exercises WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id],
    );
    return result.rows;
  }

  async create(data) {
    const { query, values } = buildInsertQuery("exercises", data);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(id, fields = {}) {
    const { query, values } = buildUpdateQuery("exercises", id, fields);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await db.query(
      "DELETE FROM exercises WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }

  async getMuscleGroupsForExercise(exerciseId) {
    const result = await db.query(
      `
      SELECT mg.*
      FROM muscle_groups mg
      JOIN exercise_muscle_groups emg ON emg.muscle_group_id = mg.id
      WHERE emg.exercise_id = $1
    `,
      [exerciseId],
    );

    return result.rows;
  }

  async addMuscleGroupsToExercise(exerciseId, muscleGroupIds = []) {
    const values = muscleGroupIds
      .map((mgId, i) => `($1, $${i + 2})`)
      .join(", ");

    const query = `
      INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id)
      VALUES ${values}
      ON CONFLICT DO NOTHING
    `;

    await db.query(query, [exerciseId, ...muscleGroupIds]);
  }

  async replaceMuscleGroups(exerciseId, muscleGroupIds = []) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "DELETE FROM exercise_muscle_groups WHERE exercise_id = $1",
        [exerciseId],
      );

      if (muscleGroupIds.length > 0) {
        const values = muscleGroupIds
          .map((mgId, i) => `($1, $${i + 2})`)
          .join(", ");

        const insertQuery = `
          INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id)
          VALUES ${values}
        `;

        await client.query(insertQuery, [exerciseId, ...muscleGroupIds]);
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async removeMuscleGroup(exerciseId, muscleGroupId) {
    const query = `
      DELETE FROM exercise_muscle_groups
      WHERE exercise_id = $1 AND muscle_group_id = $2
    `;
    const values = [exerciseId, muscleGroupId];

    const result = await db.query(query, values);
    return result; // result.rowCount tells you how many rows were deleted
  }
}

module.exports = new Exercise();
