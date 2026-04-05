module.exports = function(requiredRoles = []) {
    return (req, res, next) => {
        //req.user comes from authMiddleware
        if(!req.user || !requiredRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied"});
        }
        next();
    };
};