# Thinkscribe Backend Swagger API Documentation

This folder contains the OpenAPI 3.0 (Swagger) documentation for the Thinkscribe backend, fully migrated to Postgres/Drizzle ORM with robust, normalized RBAC. All endpoints enforce RBAC and use the new Postgres schema. Legacy MySQL/Knex code has been removed.

## Structure

- `auth.yml`: Authentication endpoints (login, JWT validation, etc.)
- `users.yml`: User management endpoints with Clerk integration
- `products.yml`: Product and product category management endpoints
- `projects.yml`: Project management endpoints with PDF list support
- `embedding-tasks.yml`: Embedding task management endpoints with external service integration
- `rbac_endpoints.yml`: Detailed RBAC endpoints (roles, modules, sub-modules, permissions, actions, channels, etc.)

## API Modules

### Authentication (`auth.yml`)

- JWT-based authentication with Clerk integration
- Token validation and refresh endpoints

### Users (`users.yml`)

- User CRUD operations with Clerk synchronization
- Profile management and user search

### Products (`products.yml`)

- Product and category management
- Inventory and pricing operations

### Projects (`projects.yml`)

- Project lifecycle management
- PDF document association and management
- Search and filtering capabilities
- Full CRUD operations with pagination
- Integration with ThinkSource API for research paper discovery

### Embedding Tasks (`embedding-tasks.yml`)

- PDF embedding task management with external service integration
- Task creation, monitoring, and status tracking
- Webhook support for external service updates
- Project association and user ownership
- Real-time status updates and progress tracking

### RBAC (`rbac_endpoints.yml`)

- Role-based access control endpoints
- Permission and module management

## Usage

- Import `openapi.yml` into Swagger UI, Redoc, or any OpenAPI-compatible tool.
- You can reference or merge `rbac_endpoints.yml` and `tags.yml` for a complete API explorer experience.

## RBAC & Security

- All endpoints are protected by JWT bearer authentication.
- RBAC is enforced at all layers, using the new normalized Postgres schema and Drizzle ORM.

## Error Response Format

All error responses use the following format (via the sendResponse utility):

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized Access!",
  "data": [
    {
      "path": "/api/v1/users",
      "message": "Unauthorized Access!"
    }
  ],
  "meta": null
}
```

- `statusCode`: HTTP status code (e.g., 401, 404, 500)
- `message`: Human-readable error message
- `data`: Array of error details (each with `path` and `message`)
- `meta`: Optional metadata (usually null for errors)

## Testing Guides

- `projects-testing-guide.md`: Comprehensive testing guide for Projects API with authentication examples
- `embedding-tasks-testing-guide.md`: Complete testing guide for Embedding Tasks API with webhook examples

## Environment Configuration

### New Environment Variables for Embedding Tasks

```bash
# External Embedding Service Configuration
EXTERNAL_SERVICE_BASE_URL=https://your-embedding-service.com
EXTERNAL_SERVICE_TOKEN=your-service-api-token
WEBHOOK_SECRET_TOKEN=your-webhook-secret-token
```

These variables are required for:
- **EXTERNAL_SERVICE_BASE_URL**: Base URL for the external PDF embedding service
- **EXTERNAL_SERVICE_TOKEN**: API token for authenticating with the external service
- **WEBHOOK_SECRET_TOKEN**: Secret token for validating webhook requests from the external service

### Integration Flow

1. **Project Creation**: Users create projects which automatically search for relevant research papers via ThinkSource API
2. **Embedding Task Creation**: Users can create embedding tasks from project papers, which initiates external PDF processing
3. **Status Updates**: External service updates task status via webhook as processing completes
4. **Real-time Monitoring**: Users can monitor task progress and individual paper status through the API

## Maintainers

- Thinkscribe Dev Team
