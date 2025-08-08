function buildInsertQuery(table, data) {
  const keys = Object.keys(data);
  const columns = keys.join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const values = Object.values(data);

  const query = `
    INSERT INTO ${table} (${columns})
    VALUES (${placeholders})
    RETURNING *;
  `;

  return { query, values };
}

function buildUpdateQuery(table, id, data) {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new Error("No fields provided for update.");
  }

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const values = Object.values(data);

  const query = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;

  values.push(id);

  return { query, values };
}

module.exports = { buildInsertQuery, buildUpdateQuery };
