const authenticateToken = (req, res, next) => {

    const token = req.cookies.token;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(403).json({ result: "Error: Invalid Token" });
        } else {
            const user = decoded; 
            req.userId = user._id
            next();
        }
    });
}
module.exports = authenticateToken;