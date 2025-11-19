const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

function parseQueryDates(q) {
  const start = q.start ? new Date(q.start) : new Date(new Date().setMonth(new Date().getMonth() - 18));
  const end = q.end ? new Date(q.end) : new Date();
  return { start, end };
}

// /api/sales/summary?start=&end=&region=&group=month|quarter
router.get('/summary', async (req, res) => {
  try {
    const { start, end } = parseQueryDates(req.query);
    const region = req.query.region;
    const groupBy = req.query.group || 'month';

    const match = { orderDate: { $gte: start, $lte: end } };
    if (region) match.region = region;

    // unwind items to compute revenue per item
    const pipeline = [
      { $match: match },
      { $unwind: '$items' },
      { $addFields: { revenue: { $multiply: [ '$items.price', '$items.quantity' ] } } }
    ];

    // period projection
    if (groupBy === 'quarter') {
      pipeline.push({
        $addFields: {
          year: { $year: '$orderDate' },
          quarter: { $ceil: { $divide: [ { $month: '$orderDate' }, 3 ] } }
        }
      });
      pipeline.push({
        $group: {
          _id: { year: '$year', quarter: '$quarter' },
          revenue: { $sum: '$revenue' }
        }
      });
      pipeline.push({
        $sort: { '_id.year': 1, '_id.quarter': 1 }
      });
      const rows = await Order.aggregate(pipeline);
      return res.json(rows.map(r => ({ period: `${r._id.year}-Q${r._id.quarter}`, revenue: r.revenue })));
    }

    // default month
    pipeline.push({
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } },
        revenue: { $sum: '$revenue' }
      }
    });
    pipeline.push({ $sort: { '_id': 1 } });
    const rows = await Order.aggregate(pipeline);
    return res.json(rows.map(r => ({ period: r._id, revenue: r.revenue })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// /api/sales/top-products?start=&end=&region=
router.get('/top-products', async (req, res) => {
  try {
    const { start, end } = parseQueryDates(req.query);
    const region = req.query.region;
    const match = { orderDate: { $gte: start, $lte: end } };
    if (region) match.region = region;

    const rows = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, quantity: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);
    res.json(rows.map(r => ({ name: r._id, revenue: r.revenue, quantity: r.quantity })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// /api/sales/category-contribution?start=&end=&region=
router.get('/category-contribution', async (req, res) => {
  try {
    const { start, end } = parseQueryDates(req.query);
    const region = req.query.region;
    const match = { orderDate: { $gte: start, $lte: end } };
    if (region) match.region = region;

    const rows = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } }
    ]);

    const total = rows.reduce((s, r) => s + r.revenue, 0) || 1;
    res.json(rows.map(r => ({ category: r._id, revenue: r.revenue, pct: (r.revenue / total) * 100 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// /api/sales/region-trends?start=&end=&group=month|quarter
router.get('/region-trends', async (req, res) => {
  try {
    const { start, end } = parseQueryDates(req.query);
    const groupBy = req.query.group || 'month';
    const match = { orderDate: { $gte: start, $lte: end } };

    const pipeline = [
      { $match: match },
      { $unwind: '$items' },
      { $addFields: { revenue: { $multiply: [ '$items.price', '$items.quantity' ] } } }
    ];

    if (groupBy === 'quarter') {
      pipeline.push({ $addFields: { year: { $year: '$orderDate' }, quarter: { $ceil: { $divide: [ { $month: '$orderDate' }, 3 ] } } } });
      pipeline.push({ $group: { _id: { region: '$region', year: '$year', quarter: '$quarter' }, revenue: { $sum: '$revenue' } } });
      pipeline.push({ $sort: { '_id.region': 1, '_id.year': 1, '_id.quarter': 1 } });
      const rows = await Order.aggregate(pipeline);
      // pivot by region
      const map = {};
      rows.forEach(r => {
        const key = `${r._id.year}-Q${r._id.quarter}`;
        map[r._id.region] = map[r._id.region] || [];
        map[r._id.region].push({ period: key, revenue: r.revenue });
      });
      return res.json(map);
    }

    // month
    pipeline.push({ $group: { _id: { region: '$region', period: { $dateToString: { format: '%Y-%m', date: '$orderDate' } } }, revenue: { $sum: '$revenue' } } });
    pipeline.push({ $sort: { '_id.region': 1, '_id.period': 1 } });
    const rows = await Order.aggregate(pipeline);
    const map = {};
    rows.forEach(r => {
      map[r._id.region] = map[r._id.region] || [];
      map[r._id.region].push({ period: r._id.period, revenue: r.revenue });
    });
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
