const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

const router = express.Router();

router.get("", async function (req, res, next) {
  const result = await db.query(`SELECT code, name FROM companies`);
  return res.json({ companies: result.rows });
});

router.get("/:code", async function (req, res, next) {
  try {
    const code = req.params.code;
    const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);
    if (result.rows.length === 0) {
      return next();
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.post("", async function (req, res, next) {
  try {
    if (
      !("code" in req.body) ||
      !("name" in req.body) ||
      !("description" in req.body)
    ) {
      throw new ExpressError("Request must contain valid JSON", 400);
    }
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put("/:code", async function (req, res, next) {
  try {
    const code = req.params.code;
    if (!("name" in req.body) || !("description" in req.body)) {
      throw new ExpressError("Request must contain valid JSON", 400);
    }
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET name = $1, description = $2
      WHERE code = $3
      RETURNING *`,
      [name, description, code]
    );
    if (result.rows.length === 0) {
      return next();
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    const code = req.params.code;
    const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);
    if (result.rows.length === 0) {
      return next();
    }
    const deleted = await db.query(`DELETE FROM companies WHERE code = $1`, [
      code,
    ]);
    return res.json({ status: "deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
