export function getProfile(req, res) {
  const user = req.user || null;
  res.json({ success: true, data: user });
}

export { getProfile };
