// Middleware: Check valid session
function checkAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ success: false, message: "Unauthorized: Please login" });
    }
}

// Middleware: Check if user is owner
function checkOwner(req, res, next) {
    if (req.session.role === 'owner') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access Denied: Owner only" });
    }
}

module.exports = { checkAuth, checkOwner };