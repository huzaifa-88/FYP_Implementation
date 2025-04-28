const jwt = require('jsonwebtoken');

// Secret key (should be hidden in .env file in real apps)
const JWT_SECRET = 'STRONG67899!JWTTOKENISOPEN'; // Change this to a strong secret

function generateToken(user) {
  const payload = {
    userid: user.userid,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
}

module.exports = generateToken;
