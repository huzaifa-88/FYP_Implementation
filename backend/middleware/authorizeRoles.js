const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        console.log(roles);
        console.log("Requested User Role", req.user.role);
      return res.status(403).json({ message: 'Access forbidden: insufficient role' });
    }
    next();
  };
};

module.exports = { authorizeRoles };