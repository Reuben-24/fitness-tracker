const db = require("../pool");
const { buildInsertQuery, buildUpdateQuery } = require("../utils");

class WorkoutSession {
  async getById(id) {
    const result = await db.query(
      "SELECT * FROM workout_sessions WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  async getAllByUserId(user_id) {
    const result = await db.query(
      "SELECT * FROM workout_sessions WHERE user_id = $1 ORDER BY started_at DESC",
      [user_id]
    );
    return result.rows;
  }

  async getAllDetails(workout_session_id) {
    const result = await db.query(
      `
      SELECT
        ws.*,
        json_agg(
          json_build_object(
            'id', se.id,
            'exercise_id', se.exercise_id,
            'position', se.position,
            'sets', (
              SELECT json_agg(
                json_build_object(
                  'id', es.id,
                  'set_number', es.set_number,
                  'reps', es.reps,
                  'weight', es.weight,
                  'completed', es.completed
                )
                ORDER BY es.set_number
              )
              FROM exercise_sets es
              WHERE es.session_exercise_id = se.id
            )
          )
          ORDER BY se.position
        ) AS exercises
      FROM workout_sessions ws
      LEFT JOIN session_exercises se ON se.workout_session_id = ws.id
      WHERE ws.id = $1
      GROUP BY ws.id;
    `,
      [workout_session_id]
    );

    return result.rows[0];
  }

  async createSessionWithDetails(sessionData) {
    // sessionData expected shape:
    // {
    //   user_id,
    //   workout_template_id,
    //   started_at,
    //   finished_at,
    //   exercises: [
    //     {
    //       exercise_id,
    //       position,
    //       sets: [
    //         { set_number, reps, weight, completed },
    //         ...
    //       ]
    //     },
    //     ...
    //   ]
    // }

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Insert into workout_sessions
      const sessionResult = await client.query(
        `INSERT INTO workout_sessions (user_id, workout_template_id, started_at, finished_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
        [
          sessionData.user_id,
          sessionData.workout_template_id,
          sessionData.started_at,
          sessionData.finished_at,
        ]
      );

      const workout_session_id = sessionResult.rows[0].id;

      // Insert session_exercises
      for (const exercise of sessionData.exercises) {
        const sessionExerciseResult = await client.query(
          `INSERT INTO session_exercises (workout_session_id, exercise_id, position)
         VALUES ($1, $2, $3)
         RETURNING id`,
          [workout_session_id, exercise.exercise_id, exercise.position]
        );

        const session_exercise_id = sessionExerciseResult.rows[0].id;

        // Insert exercise_sets for this session_exercise
        for (const set of exercise.sets) {
          await client.query(
            `INSERT INTO exercise_sets (session_exercise_id, set_number, reps, weight, completed)
           VALUES ($1, $2, $3, $4, $5)`,
            [
              session_exercise_id,
              set.set_number,
              set.reps,
              set.weight,
              set.completed,
            ]
          );
        }
      }

      await client.query("COMMIT");

      return { id: workout_session_id };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateSessionWithDetails(id, sessionData) {
    // sessionData expected shape:
    // {
    //   user_id,
    //   workout_template_id,
    //   started_at,
    //   finished_at,
    //   exercises: [
    //     {
    //       exercise_id,
    //       position,
    //       sets: [
    //         { set_number, reps, weight, completed },
    //         ...
    //       ]
    //     },
    //     ...
    //   ]
    // }

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Update workout_sessions main row
      await client.query(
        `UPDATE workout_sessions
       SET user_id = $1,
           workout_template_id = $2,
           started_at = $3,
           finished_at = $4
       WHERE id = $5`,
        [
          sessionData.user_id,
          sessionData.workout_template_id,
          sessionData.started_at,
          sessionData.finished_at,
          id,
        ]
      );

      // Delete old session_exercises & exercise_sets (cascade should delete sets)
      await client.query(
        `DELETE FROM session_exercises WHERE workout_session_id = $1`,
        [id]
      );

      // Re-insert all exercises and sets
      for (const exercise of sessionData.exercises) {
        const sessionExerciseResult = await client.query(
          `INSERT INTO session_exercises (workout_session_id, exercise_id, position)
         VALUES ($1, $2, $3)
         RETURNING id`,
          [id, exercise.exercise_id, exercise.position]
        );

        const session_exercise_id = sessionExerciseResult.rows[0].id;

        for (const set of exercise.sets) {
          await client.query(
            `INSERT INTO exercise_sets (session_exercise_id, set_number, reps, weight, completed)
           VALUES ($1, $2, $3, $4, $5)`,
            [
              session_exercise_id,
              set.set_number,
              set.reps,
              set.weight,
              set.completed,
            ]
          );
        }
      }

      await client.query("COMMIT");
      return { id };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id) {
    const result = await db.query(
      "DELETE FROM workout_sessions WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new WorkoutSession();
