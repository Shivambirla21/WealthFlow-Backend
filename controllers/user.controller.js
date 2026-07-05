import * as User from '../models/user.model.js';

function getProfile(req, res) {
  res.json({ success: true, data: User.getCurrentUser() });
}

export { getProfile };
