/**
 * logger — Winston-backed logging for the TTACart framework.
 *
 * Two ways to use it:
 *   - `logger`              -> the shared root logger (framework-wide messages)
 *   - `createLogger(scope)` -> a child logger tagged with a scope label, so
 *                              every line shows WHERE it came from. Page Objects
 *                              pass their class name as the scope, e.g.
 *                              `createLogger('LoginPage')`.
 *
 * Level is driven by the LOG_LEVEL env var (default 'info'). Output goes to the
 * console (pretty, colourised) and to `logs/combined.log` (plain text) so CI
 * runs leave an artifact behind.
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/** `2026-06-02 07:40:01 [info] [LoginPage] clicked #login-button` */
const lineFormat = printf(({ level, message, timestamp: ts, scope }) => {
    const tag = scope ? ` [${scope as string}]` : '';
    return `${ts as string} [${level}]${tag} ${message as string}`;
});

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        lineFormat,
    ),
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize({ level: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                lineFormat,
            ),
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

/**
 * Build a scoped child logger. Every line it emits carries the `scope` label.
 * Use the calling class name as the scope.
 */
export function createLogger(scope: string): winston.Logger {
    return logger.child({ scope });
}

export type Logger = winston.Logger;

let stepLogBuffer: string[] | null = null;

export function beginStepLogCapture(): void {
    stepLogBuffer = [];
}

export function endStepLogCapture(): string[] {
    const lines = stepLogBuffer ?? [];
    stepLogBuffer = null;
    return lines;
}

export function stepLog(message: string): void {
    if (!stepLogBuffer) {
        return;
    }
    const now = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map((part) => String(part).padStart(2, '0'))
        .join(':');
    stepLogBuffer.push(`${time} ${message}`);
}

export default logger;