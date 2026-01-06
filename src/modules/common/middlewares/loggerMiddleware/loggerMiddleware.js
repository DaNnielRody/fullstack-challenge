import { logger } from '#common/services/logger/logger.js';

const loggerMiddleware = (req, res, next) => {
    const start = Date.now();

    logger.http('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - start;
        
        logger.http('Response sent', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });

        return originalSend.call(this, data);
    };

    next();
};

export { loggerMiddleware };

