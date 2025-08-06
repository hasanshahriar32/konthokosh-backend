import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { DOC_USER, DOC_PASS, BASE_URL } from '../configs/envConfig';
import { projects } from '../db/schema/project';
import { embeddingTasks } from '../db/schema/embedding.task';

const router = express.Router();

// Swagger JSDoc setup
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for the ThinkScribe.',
    },
    servers: [
      {
        url: `${BASE_URL}/api/v1`,
        description: 'Base server',
      },
      {
        url: 'https://konthokosh-backend.onrender.com/api/v1',
        description: 'Production server',
      },
      {
        url: 'https://konthokosh.up.railway.app/api/v1',
        description: 'Production server 2',
      },
      {
        url: 'http://localhost:2000/api/v1',
        description: 'local server',
      },
    ],
  },
  apis: [path.join(__dirname, './swagger/*.yml')],
};
const swaggerSpec = swaggerJsdoc(options);

// Basic Auth Middleware for docs
const docAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = {
    login: DOC_USER,
    password: DOC_PASS,
  };
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64')
    .toString()
    .split(':');
  if (login && password && login === auth.login && password === auth.password) {
    return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Docs"');
  res.status(401).send('Authentication required.');
};

// --- Swagger Domain Spec Helper ---
function createDomainSpec(yamlFile: string) {
  return {
    ...options,
    apis: [path.join(__dirname, './swagger', yamlFile)],
  };
}

const domainSpecs = {
  auth: createDomainSpec('auth.yml'),
  products: createDomainSpec('products.yml'),
  posts: createDomainSpec('posts.yml'),
  rbac: createDomainSpec('rbac_endpoints.yml'),
  users: createDomainSpec('users.yml'),
  projects: createDomainSpec('projects.yml'),
  embeddingTasks: createDomainSpec('embedding-tasks.yml'), // Added embedding tasks domain spec
};

const swaggerSpecs = {
  auth: swaggerJsdoc(domainSpecs.auth),
  products: swaggerJsdoc(domainSpecs.products),
  posts: swaggerJsdoc(domainSpecs.posts),
  rbac: swaggerJsdoc(domainSpecs.rbac),
  users: swaggerJsdoc(domainSpecs.users),
  projects: swaggerJsdoc(domainSpecs.projects), 
  embeddingTasks: swaggerJsdoc(domainSpecs.embeddingTasks), // Added embedding tasks spec
};

// --- Swagger UI Routers ---
function mountSwaggerDocs(route: string, spec: object) {
  router.use(route, docAuth, swaggerUi.serveFiles(spec), swaggerUi.setup(spec));
}

// Dynamically mount all domain docs and collect for navigation
const docNavLinks: { label: string; href: string }[] = [];
Object.entries(swaggerSpecs).forEach(([key, spec]) => {
  const route = `/${key}`; // Fix: mount at /products, /auth, etc. (relative to /docs)
  mountSwaggerDocs(route, spec);
  docNavLinks.push({
    label: `${key.charAt(0).toUpperCase() + key.slice(1)} API Docs`,
    href: `/docs${route}`,
  });
});


// Navigation page for docs
router.get('/', docAuth, (req, res) => {
  res.render('docs-nav', { docNavLinks });
});

export default router;
