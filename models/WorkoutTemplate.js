const db = require("../db");
const { buildInsertQuery, buildUpdateQuery } = require("../utils");

class WorkoutTemplate {
  async getById(id) {
    const result = await db.query(
      "SELECT * FROM workout_templates WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  async getAllByUserId(user_id) {
    const result = await db.query(
      "SELECT * FROM workout_templates WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id]
    );
    return result.rows;
  }

  async getExercisesWithDetailsForWorkoutTemplate(workout_template_id) {
    const result = await db.query(
      `
      SELECT e.*, te.*
      FROM template_exercises te
      JOIN exercises e ON te.exercise_id = e.id
      WHERE te.workout_template_id = $1
      ORDER BY te.position
    `,
      [workout_template_id]
    );

    return result.rows;
  }

  async syncTemplateExercises(template_id, exercises = []) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `DELETE FROM template_exercises WHERE workout_template_id = $1`,
        [template_id]
      );

      const insertValues = [];
      const valuePlaceholders = [];

      exercises.forEach((ex, i) => {
        const baseIndex = i * 5;
        valuePlaceholders.push(
          `($1, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${
            baseIndex + 5
          }, $${baseIndex + 6})`
        );
        insertValues.push(
          ex.exercise_id,
          ex.sets,
          ex.reps,
          ex.weight,
          ex.position
        );
      });

      if (exercises.length > 0) {
        await client.query(
          `
        INSERT INTO template_exercises
        (workout_template_id, exercise_id, sets, reps, weight, position)
        VALUES ${valuePlaceholders.join(", ")}
        `,
          [template_id, ...insertValues]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async create(data) {
    const { query, values } = buildInsertQuery("workout_templates", data);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(id, fields = {}) {
    const { query, values } = buildUpdateQuery("workout_templates", id, fields);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await db.query(
      "DELETE FROM workout_templates WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new WorkoutTemplate();
