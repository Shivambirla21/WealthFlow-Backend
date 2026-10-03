import * as Dashboard from '../models/dashboard.model.js';

async function getSummary(req, res) {
  try {
    const data = await Dashboard.getSummary(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export { getSummary };
