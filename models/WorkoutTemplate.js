const db = require("./pool");
const { buildInsertQuery, buildUpdateQuery } = require("./utils");

class WorkoutTemplate {
  async getByIdWithExercises(workout_template_id) {
    // 1. Fetch the template info
    const templateResult = await db.query(
      `
        SELECT *
        FROM workout_templates
        WHERE id = $1
        `,
      [workout_template_id],
    );

    if (templateResult.rows.length === 0) return null;

    const template = templateResult.rows[0];

    // 2. Fetch exercises with their muscle groups
    const exercisesResult = await db.query(
      `
      SELECT 
        e.id AS exercise_id,
        e.user_id AS exercise_user_id,
        e.name AS exercise_name,
        e.description,
        e.equipment,
        e.created_at AS exercise_created_at,
        e.updated_at AS exercise_updated_at,
        te.id AS template_exercise_id,
        te.sets,
        te.reps,
        te.weight,
        te.position,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', mg.id,
              'name', mg.name
            )
          ) FILTER (WHERE mg.id IS NOT NULL), '[]'
        ) AS muscle_groups
      FROM template_exercises te
      JOIN exercises e ON te.exercise_id = e.id
      LEFT JOIN exercise_muscle_groups emg ON e.id = emg.exercise_id
      LEFT JOIN muscle_groups mg ON emg.muscle_group_id = mg.id
      WHERE te.workout_template_id = $1
      GROUP BY e.id, te.id
      ORDER BY te.position
      `,
      [workout_template_id],
    );

    // 3. Return a structured object
    return {
      ...template,
      exercises: exercisesResult.rows.map((row) => ({
        id: row.exercise_id,
        user_id: row.exercise_user_id,
        name: row.exercise_name,
        description: row.description,
        equipment: row.equipment,
        created_at: row.exercise_created_at,
        updated_at: row.exercise_updated_at,
        template_exercise_id: row.template_exercise_id,
        sets: row.sets,
        reps: row.reps,
        weight: row.weight,
        position: row.position,
        muscle_groups: row.muscle_groups,
      })),
    };
  }

  async getAllByUserId(user_id) {
    const result = await db.query(
      "SELECT * FROM workout_templates WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id],
    );
    return result.rows;
  }

  async createWithExercises(userId, name, exercises = []) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Step 1: create workout template
      const templateRes = await client.query(
        `INSERT INTO workout_templates (user_id, name)
        VALUES ($1, $2)
        RETURNING *`,
        [userId, name],
      );
      const newTemplate = templateRes.rows[0];

      // Step 2: insert exercises (if any)
      if (exercises.length > 0) {
        const insertPromises = exercises.map((ex) =>
          client.query(
            `INSERT INTO template_exercises
              (workout_template_id, exercise_id, sets, reps, weight, position)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              newTemplate.id,
              ex.exercise_id,
              ex.sets,
              ex.reps,
              ex.weight,
              ex.position,
            ],
          ),
        );
        await Promise.all(insertPromises);
      }

      await client.query("COMMIT");
      return { ...newTemplate, exercises };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async updateWithExercises(
    templateId,
    userId,
    fieldsToUpdate,
    exercises = [],
  ) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Step 1: ensure template belongs to user
      const existingRes = await client.query(
        `SELECT * FROM workout_templates WHERE id = $1 AND user_id = $2`,
        [templateId, userId],
      );
      const existingTemplate = existingRes.rows[0];
      if (!existingTemplate) {
        throw new Error("Workout Template not found");
      }

      // Step 2: update workout_templates fields (if any)
      let updatedTemplate = existingTemplate;
      if (Object.keys(fieldsToUpdate).length > 0) {
        const setClause = Object.keys(fieldsToUpdate)
          .map((key, idx) => `${key} = $${idx + 3}`)
          .join(", ");
        const values = [templateId, userId, ...Object.values(fieldsToUpdate)];

        const updateRes = await client.query(
          `UPDATE workout_templates
          SET ${setClause}
          WHERE id = $1 AND user_id = $2
          RETURNING *`,
          values,
        );
        updatedTemplate = updateRes.rows[0];
      }

      // Step 3: resync exercises if provided
      if (Array.isArray(exercises)) {
        // clear old exercises
        await client.query(
          `DELETE FROM template_exercises WHERE workout_template_id = $1`,
          [templateId],
        );

        // insert new ones
        if (exercises.length > 0) {
          const insertPromises = exercises.map((ex) =>
            client.query(
              `INSERT INTO template_exercises
                (workout_template_id, exercise_id, sets, reps, weight, position)
              VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                templateId,
                ex.exercise_id,
                ex.sets,
                ex.reps,
                ex.weight,
                ex.position,
              ],
            ),
          );
          await Promise.all(insertPromises);
        }
      }

      await client.query("COMMIT");
      return { ...updatedTemplate, exercises };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id, user_id) {
    const result = await db.query(
      `
      DELETE FROM workout_templates
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [id, user_id],
    );

    if (result.rows.length === 0) {
      throw new Error(
        "Workout template not found or does not belong to the user",
      );
    }

    return result.rows[0];
  }
}

module.exports = new WorkoutTemplate();
