import * as Dashboard from '../models/dashboard.model.js';

function getSummary(req, res) {
  res.json({ success: true, data: Dashboard.getSummary() });
}

export { getSummary };
