const express = require('express');
const fs = require('fs/promises'); // async file I/O
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}


// GET /api/items?limit=20&page=1&q=foo
router.get('/', async (req, res, next) => {
  try {
    const {
      limit = 20,
      page = 1,
      q = '',
    } = req.query;

    const l = Math.max(1, parseInt(limit, 10));
    const p = Math.max(1, parseInt(page, 10));
    const ql = q.trim().toLowerCase();

    let data = await readData();
    if (ql) data = data.filter(i => i.name.toLowerCase().includes(ql));

    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / l));
    const startIdx = (p - 1) * l;
    const items = data.slice(startIdx, startIdx + l);

    res.json({ items, page: p, totalPages, total, limit: l, q: ql });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === +req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const item = { ...req.body, id: Date.now() };
    const data = await readData();
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
