"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireCreator = exports.authMiddleware = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: 'No authorization header'
            });
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                error: 'No token provided'
            });
        }
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                error: 'Invalid token'
            });
        }
        ;
        req.user = {
            id: user.id,
            email: user.email || '',
            role: user.user_metadata?.role || 'user'
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('Auth middleware error:', error);
        res.status(401).json({
            error: 'Authentication failed'
        });
    }
};
exports.authMiddleware = authMiddleware;
const requireCreator = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Creator access required'
            });
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Creator check error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};
exports.requireCreator = requireCreator;
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({
            error: 'Admin access required'
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map