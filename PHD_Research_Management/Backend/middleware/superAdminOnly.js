module.exports = (req, res, next) => {

    if (!req.user?.is_super_admin) {
        return res.status(403).json({
            message: "Super Admin access required"
        });
    }

    next();
};
