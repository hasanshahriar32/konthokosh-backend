# User Table Schema (Drizzle ORM + drizzle-zod)

- **id**: UUID (primary key, generated automatically)
- **firstName**: string (max 64 chars, required)
- **lastName**: string (max 64 chars, required)
- **emails**: JSONB (array of objects: `{ email: string, type: 'primary' | 'additional' }`, required)
- **isActive**: boolean (default: true)
- **isDeleted**: boolean (default: false)
- **lastLogin**: timestamp (nullable)
- **createdAt**: timestamp (default: now)
- **updatedAt**: timestamp (default: now)
- **clerkUID**: string (max 128 chars, required, unique)

## Validation (drizzle-zod)

- `emails` must be an array of objects with:
  - `email`: valid email string
  - `type`: either 'primary' or 'additional'

## Example emails value

```json
[
  { "email": "user@example.com", "type": "primary" },
  { "email": "alt@example.com", "type": "additional" }
]
```

## Example Zod schema for emails

```ts
const emailObjectSchema = z.object({
  email: z.string().email(),
  type: z.enum(['primary', 'additional'])
});

// Used in insertUserSchema/selectUserSchema
emails: z.array(emailObjectSchema)
```

## Notes

- All user IDs are UUIDs, not serial integers.
- The `emails` field is strictly validated for structure and content.
- All user creation and update endpoints must provide emails as an array of objects as shown above.
