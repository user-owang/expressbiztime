const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

const router = express.Router();

router.get("", async function (req, res, next) {
  const result = await db.query(`SELECT id, comp_code FROM invoices`);
  return res.json({ invoices: result.rows });
});

router.get("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const result = await db.query(
      `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description
      FROM invoices AS i INNER JOIN companies AS c ON (i.comp_code = c.code)
      WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return next();
    }
    data = result.rows[0];
    const invoice = {
      invoice: {
        id: data.id,
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
        company: {
          code: data.comp_code,
          name: data.name,
          description: data.description,
        },
      },
    };
    return res.json(invoice);
  } catch (err) {
    return next(err);
  }
});

router.post("", async function (req, res, next) {
  try {
    if (!("comp_code" in req.body) || !("amt" in req.body)) {
      throw new ExpressError("Request must contain valid JSON", 400);
    }
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING *`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    if (!("amt" in req.body)) {
      throw new ExpressError("Request must contain valid JSON", 400);
    }
    const amt = req.body.amt;
    const result = await db.query(
      `UPDATE invoices SET amt = $1
      WHERE code = $2
      RETURNING *`,
      [amt, id]
    );
    if (result.rows.length === 0) {
      return next();
    }
    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return next();
    }
    const deleted = await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);
    return res.json({ status: "deleted" });
  } catch (err) {
    next(err);
  }
});

router.get("/companies/:code", async function (req, res, next) {
  try {
    const code = req.params.code;
    const result = await db.query(
      `SELECT c.name, c.code, c.description, i.id, i.amt, i.paid, i.add_date, i.paid_date
      FROM companies AS c INNER JOIN invoices AS i ON (c.code = i.comp_code)
      WHERE code = $1`,
      [code]
    );
    if (result.rows.length === 0) {
      next();
    }
    return res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
