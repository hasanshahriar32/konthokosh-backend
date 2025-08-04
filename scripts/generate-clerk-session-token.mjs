/* eslint-disable no-undef */
//@ts-ignore 
import axios from 'axios';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import clipboardy from 'clipboardy';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_USER_ID = process.env.CLERK_USER_ID;

/**
 * Clerk API: List all sessions for a user (GET /sessions?user_id=...)
 * Returns an array of session objects (not just IDs)
 */
export async function getSessionsForUser(userId) {
  if (!CLERK_SECRET_KEY) throw new Error('CLERK_SECRET_KEY is not set');
  const url = `https://api.clerk.com/v1/sessions?user_id=${userId}`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}

/**
 * Clerk API: Create a session token for a session (POST /sessions/{session_id}/tokens)
 * Returns the JWT token string
 */
// Set a higher default JWT lifetime for development (e.g., 24 hours = 86400 seconds)
const DEFAULT_JWT_LIFETIME = 86400; // 24 hours

export async function createSessionToken(sessionId, expiresInSeconds = DEFAULT_JWT_LIFETIME) {
  if (!CLERK_SECRET_KEY) throw new Error('CLERK_SECRET_KEY is not set');
  const url = `https://api.clerk.com/v1/sessions/${sessionId}/tokens`;
  const body = {};
  if (expiresInSeconds) body.expires_in_seconds = expiresInSeconds;
  const res = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data.jwt;
}

/**
 * Gets the first available session ID for a given Clerk user ID.
 * @param userId The Clerk user ID (e.g., 'user_...')
 * @returns The first session ID string, or throws if none found
 */
export async function getFirstSessionIdForUser(userId) {
  const sessions = await getSessionsForUser(userId);
  if (!sessions.length) throw new Error('No sessions found for user');
  return sessions[0].id;
}

function saveTokenToFile(token) {
  const filePath = path.join(__dirname, '../clerk-session-token.txt');
  fs.writeFileSync(filePath, token, 'utf8');
}

// Usage:
// node ./scripts/generate-clerk-session-token.js <session_id>
// node ./scripts/generate-clerk-session-token.js --list <user_id>
// node ./scripts/generate-clerk-session-token.js --user <user_id>

(async () => {
  try {
    const [,, arg1, arg2] = process.argv;
    const handleToken = (token) => {
      // console.log(token);
      saveTokenToFile(token);
      clipboardy.writeSync(token);
      console.info('(24H jwt token copied to clipboard)');
    };
    // If user ID is set in .env and no CLI arg, use it
    if (!arg1 && CLERK_USER_ID) {
      // Confirm with user before proceeding, with 3s timeout defaulting to yes
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      let answered = false;
      const timer = setTimeout(() => {
        if (!answered) {
          rl.write('\n');
          rl.close();
          proceedWithUserId();
        }
      }, 3000);
      function proceedWithUserId() {
        answered = true;
        clearTimeout(timer);
        (async () => {
          try {
            const sessions = await getSessionsForUser(CLERK_USER_ID);
            if (!sessions.length) throw new Error('No sessions found for user');
            const sessionId = sessions[0].id;
            const token = await createSessionToken(sessionId);
            if (token) {
              handleToken(token);
            } else {
              process.exitCode = 1;
            }
          } catch (err) {
            if (err?.response?.data?.errors?.[0]?.message) {
              console.error(err.response.data.errors[0].message);
            } else {
              console.error(err.message || err);
            }
            process.exitCode = 1;
          }
        })();
      }
      rl.question(`Use Clerk user ID from .env: ${CLERK_USER_ID}? (y/n) [auto-yes in 3s]: `, (answer) => {
        if (answered) return;
        answered = true;
        clearTimeout(timer);
        if (answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes' || answer.trim() === '') {
          proceedWithUserId();
        } else {
          // Fallback to prompt for user input with 10s timeout
          const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
          let answered2 = false;
          const timer2 = setTimeout(() => {
            if (!answered2) {
              rl2.write('\n');
              rl2.close();
              console.error('No input received in 10 seconds. Exiting.');
              process.exit(1);
            }
          }, 10000);
          rl2.question('Enter Clerk user ID (user_...) or session ID (sess_...) [exit in 10s]: ', async (input) => {
            if (answered2) return;
            answered2 = true;
            clearTimeout(timer2);
            rl2.close();
            try {
              if (input.startsWith('user_')) {
                const sessions = await getSessionsForUser(input);
                if (!sessions.length) throw new Error('No sessions found for user');
                const sessionId = sessions[0].id;
                const token = await createSessionToken(sessionId);
                if (token) {
                  handleToken(token);
                } else {
                  process.exitCode = 1;
                }
              } else if (input.startsWith('sess_')) {
                const token = await createSessionToken(input);
                if (token) {
                  handleToken(token);
                } else {
                  process.exitCode = 1;
                }
              } else {
                console.error('Input must start with user_ or sess_');
                process.exitCode = 1;
              }
            } catch (err) {
              if (err?.response?.data?.errors?.[0]?.message) {
                console.error(err.response.data.errors[0].message);
              } else {
                console.error(err.message || err);
              }
              process.exitCode = 1;
            }
          });
        }
      });
      return;
    }
    // If no CLI arg and no .env user ID, prompt
    if (!arg1) {
      // Prompt user for input if no argument is provided, with 10s timeout to exit
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      let answered = false;
      const timer = setTimeout(() => {
        if (!answered) {
          rl.write('\n');
          rl.close();
          console.error('No input received in 10 seconds. Exiting.');
          process.exit(1);
        }
      }, 10000);
      rl.question('Enter Clerk user ID (user_...) or session ID (sess_...) [exit in 10s]: ', async (input) => {
        if (answered) return;
        answered = true;
        clearTimeout(timer);
        rl.close();
        try {
          if (input.startsWith('user_')) {
            const sessions = await getSessionsForUser(input);
            if (!sessions.length) throw new Error('No sessions found for user');
            const sessionId = sessions[0].id;
            const token = await createSessionToken(sessionId);
            if (token) {
              handleToken(token);
            } else {
              process.exitCode = 1;
            }
          } else if (input.startsWith('sess_')) {
            const token = await createSessionToken(input);
            if (token) {
              handleToken(token);
            } else {
              process.exitCode = 1;
            }
          } else {
            console.error('Input must start with user_ or sess_');
            process.exitCode = 1;
          }
        } catch (err) {
          if (err?.response?.data?.errors?.[0]?.message) {
            console.error(err.response.data.errors[0].message);
          } else {
            console.error(err.message || err);
          }
          process.exitCode = 1;
        }
      });
      return;
    }
    if (arg1 === '--list') {
      if (!arg2) throw new Error('User ID required as second argument');
      const sessions = await getSessionsForUser(arg2);
      sessions.forEach(s => console.log(s.id));
      if (!sessions.length) process.exitCode = 1;
      return;
    }
    if (arg1 === '--user') {
      if (!arg2) throw new Error('User ID required as second argument');
      const sessions = await getSessionsForUser(arg2);
      if (!sessions.length) throw new Error('No sessions found for user');
      const sessionId = sessions[0].id;
      const token = await createSessionToken(sessionId);
      if (token) {
        handleToken(token);
      } else {
        process.exitCode = 1;
      }
      return;
    }
    const sessionId = arg1;
    if (!sessionId) throw new Error('Session ID required as first argument');
    const token = await createSessionToken(sessionId);
    if (token) {
      handleToken(token);
    } else {
      process.exitCode = 1;
    }
  } catch (err) {
    if (err?.response?.data?.errors?.[0]?.message) {
      console.error(err.response.data.errors[0].message);
    } else {
      console.error(err.message || err);
    }
    process.exitCode = 1;
  }
})();
