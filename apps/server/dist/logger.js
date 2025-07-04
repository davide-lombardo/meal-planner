import { createLogger, format, transports } from 'winston';
const logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.errors({ stack: true }), format.splat(), format.json()),
    defaultMeta: { service: 'meal-planner-server' },
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), format.printf(({ timestamp, level, message, ...meta }) => {
                return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            }))
        })
    ]
});
export default logger;
