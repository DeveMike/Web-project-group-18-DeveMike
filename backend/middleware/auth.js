const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {

        const authHeader = req.headers['authorization'];

        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Pääsy estetty. Token puuttuu.' 
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ 
                    error: 'Virheellinen tai vanhentunut token' 
                });
            }

            req.userId = decoded.userId;
            req.email = decoded.email;
            
            next();
        });
        
    } catch (error) {
        console.error('Auth middleware virhe:', error);
        res.status(500).json({ 
            error: 'Palvelinvirhe autentikaatiossa' 
        });
    }
};

module.exports = authenticateToken;