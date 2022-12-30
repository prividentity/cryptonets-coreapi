import path from "path";

import winston, { format } from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");

const { combine, printf, timestamp } = format;
const ROOT_DIR = process.cwd();
const LOGS = path.resolve(ROOT_DIR, "logs");

const logFormat = printf(
  ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
);

const loggerConfig = {
  transports: [
    new DailyRotateFile({
      datePattern: "YYYY-MM-DD",
      level: "verbose",
      handleExceptions: true,
      json: true,
      filename: `${LOGS}/app-info-%DATE%.log`,
      maxFiles: 5,
      silent: false,
      utc: true,
    }),

    new DailyRotateFile({
      datePattern: "YYYY-MM-DD",
      level: "warn",
      handleExceptions: true,
      json: true,
      filename: `${LOGS}/app-error-%DATE%.log`,
      maxFiles: 10,
      silent: false,
      utc: true,
    }),
  ],
  format: combine(timestamp(), logFormat),
};

winston.addColors({
  debug: "green",
  info: "cyan",
  silly: "purple",
  trace: "magenta",
  verbose: "magenta",
  warn: "yellow",
  warning: "yellow",
  error: "red",
});

const logger = winston.createLogger(loggerConfig);

export default logger;
