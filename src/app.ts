import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import helmet from 'helmet';
import './cron-jobs/sample-cron';
import { accessLogFormat, auditLogFormat } from './configs/log-formats';
import auditLogStream from './middlewares/audit-log';
import { upload } from './middlewares/multer-upload';
import swaggerDocsRoute from './docs/swagger.route';
import noRouteFound from './middlewares/noRouteFound';
import globalErrorHandler from './middlewares/globalErrorHandler';
import apiLimiter from './middlewares/rateLimitMiddleware';
import path from 'path';

// Initialize the Express application
const app = express();

// Middleware to set security-related HTTP headers
app.use(helmet());

// Enable CORS for all routes and origins
app.use(cors());

// Middleware to handle file uploads using multer.
app.use(upload.any());

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Middleware to parse URL-encoded payloads (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse cookies attached to the client request
app.use(cookieParser());

// Access Logger middleware that logs each request in ISO date format, HTTP method, and URL
app.use(morgan(accessLogFormat));

// Audit Logger middleware that logs detailed request information to /src/storage/logs/audit.log file
// This includes method, URL, status, response time, content length, and request body
morgan.token('body', (req) => JSON.stringify((req as express.Request).body));
app.use(morgan(auditLogFormat, { stream: auditLogStream }));

app.use(apiLimiter);
// Register all application routes
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files from the 'views' directory (for images, etc.)
app.use(express.static(path.join(__dirname, '../views')));

app.use('/',routes);

// Register Swagger/OpenAPI documentation route
app.use('/docs', swaggerDocsRoute);
app.get('/', (req, res) => {
  res.render('index.ejs', { title: 'Welcome to the API' });
});
  
// Register custom error handling middleware at the end
// This ensures it catches errors from previous middlewares or routes
app.use(express.static('public'));
app.use(globalErrorHandler);
app.use(noRouteFound);
// Export the configured Express app for use (e.g., in server.ts)
export default app;
