const users = [
  {
    id: 'demo-user-id',
    name: 'Demo User',
    email: 'demo@wealthflow.local',
  },
];

function create(payload) {
  const user = {
    id: Date.now().toString(),
    name: payload.name || 'Demo User',
    email: payload.email,
  };

  users.push(user);
  return user;
}

function findByEmail(email) {
  return users.find((user) => user.email === email);
}

function getCurrentUser() {
  return users[0];
}

function demoUser(email) {
  return {
    id: 'demo-user-id',
    name: 'Demo User',
    email,
  };
}

export { create, findByEmail, getCurrentUser, demoUser };
