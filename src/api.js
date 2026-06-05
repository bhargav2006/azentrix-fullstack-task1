import { getDB, persistDB } from './db';
import { isValid, parseISO } from 'date-fns';

// Helper to run query and return rows as objects (for SELECT)
async function execQuery(sql, params = []) {
  const db = await getDB();
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Validation helper
function validateTransaction({ type, category, amount, date }) {
  const errors = [];

  // Type validation
  if (!type || !['income', 'expense'].includes(type)) {
    errors.push("Type must be 'income' or 'expense'.");
  }

  // Category validation
  if (!category || category.trim() === '') {
    errors.push("Category is required and cannot be empty.");
  }

  // Amount validation
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push("Amount must be a positive number greater than 0.");
  }

  // Date validation
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push("Date must be in YYYY-MM-DD format.");
  } else {
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      errors.push("Invalid date calendar value.");
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }
}

// 1. Get transactions for given month. Format: YYYY-MM. If none, return all.
export async function getTransactions(month) {
  if (month) {
    // Select transactions starting with the month string (e.g. 2026-06%)
    return execQuery(
      'SELECT * FROM transactions WHERE date LIKE ? ORDER BY date DESC, id DESC',
      [`${month}%`]
    );
  }
  return execQuery('SELECT * FROM transactions ORDER BY date DESC, id DESC');
}

// 2. Add transaction
export async function addTransaction(data) {
  validateTransaction(data);
  const { type, category, amount, date, description } = data;
  const db = await getDB();

  db.run(
    'INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)',
    [type, category.trim(), parseFloat(amount), date, description ? description.trim() : '']
  );
  persistDB();

  // Retrieve last inserted record
  const rows = await execQuery('SELECT * FROM transactions WHERE id = last_insert_rowid()');
  return rows[0] || null;
}

// 3. Update transaction
export async function updateTransaction(id, data) {
  validateTransaction(data);
  const { type, category, amount, date, description } = data;
  const db = await getDB();

  // Verify transaction exists
  const existing = await execQuery('SELECT * FROM transactions WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error(`Transaction with ID ${id} not found.`);
  }

  db.run(
    'UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ?',
    [type, category.trim(), parseFloat(amount), date, description ? description.trim() : '', id]
  );
  persistDB();

  const rows = await execQuery('SELECT * FROM transactions WHERE id = ?', [id]);
  return rows[0];
}

// 4. Delete transaction
export async function deleteTransaction(id) {
  const db = await getDB();

  // Verify transaction exists
  const existing = await execQuery('SELECT * FROM transactions WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new Error(`Transaction with ID ${id} not found.`);
  }

  db.run('DELETE FROM transactions WHERE id = ?', [id]);
  persistDB();

  return { message: "Transaction deleted successfully." };
}

// 5. Get summary of income, expense, and group expenses by category for month
export async function getSummary(month) {
  const db = await getDB();
  let filterSql = '';
  const params = [];

  if (month) {
    filterSql = 'WHERE date LIKE ?';
    params.push(`${month}%`);
  }

  // Calculate totalIncome
  const incomeResult = db.exec(
    `SELECT SUM(amount) as total FROM transactions ${filterSql ? filterSql + ' AND' : 'WHERE'} type = 'income'`,
    params
  );
  const totalIncome = incomeResult[0]?.values[0]?.[0] || 0;

  // Calculate totalExpenses
  const expenseResult = db.exec(
    `SELECT SUM(amount) as total FROM transactions ${filterSql ? filterSql + ' AND' : 'WHERE'} type = 'expense'`,
    params
  );
  const totalExpenses = expenseResult[0]?.values[0]?.[0] || 0;

  // Net Balance
  const netBalance = totalIncome - totalExpenses;

  // Group expenses by category
  // Result should return array: [{ category, total }]
  const expensesByCategory = [];
  const categoryQuery = `
    SELECT category, SUM(amount) as total 
    FROM transactions 
    ${filterSql ? filterSql + ' AND' : 'WHERE'} type = 'expense' 
    GROUP BY category 
    ORDER BY total DESC
  `;
  const stmt = db.prepare(categoryQuery);
  if (params.length > 0) {
    stmt.bind(params);
  }
  while (stmt.step()) {
    expensesByCategory.push(stmt.getAsObject());
  }
  stmt.free();

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    expensesByCategory
  };
}

// 6. Export transactions for given month as CSV text
export async function exportTransactions(month) {
  const transactions = await getTransactions(month);
  const headers = ['Type', 'Category', 'Amount', 'Date'];
  
  const csvRows = [headers.join(',')];

  transactions.forEach(t => {
    // Format values, escape category quotes
    const categoryEscaped = `"${t.category.replace(/"/g, '""')}"`;
    const row = [
      t.type,
      categoryEscaped,
      t.amount.toFixed(2),
      t.date
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}
