import fs from 'fs';
import { logDir } from '../middlewares/audit-log';

export function logAudit(message: string) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logDir, fullMessage, { encoding: 'utf-8' });
}
