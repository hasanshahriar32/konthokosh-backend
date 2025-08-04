import fs from 'fs';
import path from 'path';

// Ensure log folder exists
export const logDir = path.join(__dirname, '../storage/logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create a write stream in append mode
const auditLogStream = fs.createWriteStream(path.join(logDir, 'audit.log'), {
  flags: 'a',
});

export default auditLogStream;
