import * as User from '../models/user.model.js';

function register(req, res) {
  const user = User.create(req.body);
  res.status(201).json({ success: true, data: user });
}

function login(req, res) {
  const user = User.findByEmail(req.body.email) || User.demoUser(req.body.email);

  res.json({
    success: true,
    data: {
      token: 'demo-token',
      user,
    },
  });
}

export { register, login };
