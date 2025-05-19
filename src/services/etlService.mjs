// src/services/etlService.mjs
import pool from '../db.mjs';

// Save a new deal record
async function saveDeal({ dealName, amount, boardId }) {
  const sql = 'INSERT INTO deals (deal_name, amount, board_id) VALUES (?, ?, ?)';
  const [result] = await pool.execute(sql, [dealName, amount, boardId]);
  return result.insertId;
}

// Save a task created on Monday board
async function saveTask({ boardId, taskName }) {
  const sql = 'INSERT INTO project_tasks (board_id, task_name) VALUES (?, ?)';
  const [result] = await pool.execute(sql, [boardId, taskName]);
  return result.insertId;
}

// Fetch ETL report (all deals + associated tasks)
async function getETLReport() {
  const [deals] = await pool.query('SELECT * FROM deals');
  const [tasks] = await pool.query('SELECT * FROM project_tasks');

  const report = deals.map(deal => ({
    ...deal,
    tasks: tasks.filter(task => task.board_id === deal.board_id)
  }));

  return report;
}

export { saveDeal, saveTask, getETLReport };
