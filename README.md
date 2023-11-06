# mysql-zod

Generate Zod interfaces from MySQL database

## Installation

Install `mysql-zod` with npm

```bash
npm install mysql-zod --save-dev
```

## Usage/Examples

Create user table:

```sql
CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `role` enum('admin','user') NOT NULL,
  PRIMARY KEY (`id`)
);
```
Use the mysql-zod API:

```typescript
import { generate } from 'mysql-zod'

await generate({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'secret',
  database: 'myapp',
})
```

The generator will create a `user.ts` file with the following contents:

```typescript
import z from 'zod'

export const user = z.object({
  id: z.number().nonnegative(),
  name: z.string(),
  username: z.string(),
  password: z.string(),
  profile_picture: z.string().nullable(),
  role: z.enum(['admin', 'user']),
})

export const insertable_user = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
  profile_picture: z.string().nullable(),
  role: z.enum(['admin', 'user']),
})

export const updateable_user = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
  profile_picture: z.string().nullable(),
  role: z.enum(['admin', 'user']),
})

export const selectable_user = z.object({
  id: z.number().nonnegative(),
  name: z.string(),
  username: z.string(),
  password: z.string(),
  profile_picture: z.string().nullable(),
  role: z.enum(['admin', 'user']),
})

export type userType = z.infer<typeof user>
export type InsertableUserType = z.infer<typeof insertable_user>
export type UpdateableUserType = z.infer<typeof updateable_user>
export type SelectableUserType = z.infer<typeof selectable_user>
```

## Config

```json
{
  "host": "127.0.0.1",
  "port": 3306,
  "user": "root",
  "password": "secret",
  "database": "myapp",
  "tables": ["user", "log"],
  "ignore": ["log", "/^temp/"],
  "folder": "@zod",
  "suffix": "table",
  "camelCase": false,
  "nullish": false,
  "requiredString": false,
  "ssl": {
    "ca": "path/to/ca.pem",
    "cert": "path/to/cert.pem",
    "key": "path/to/key.pem"
  },
  "useDateType": false,
  "overrideTypes": {
    "tinyint": "z.boolean()"
  }
}
```

| Option | Description |
| ------ | ----------- |
| tables | Filter the tables to include only those specified. |
| ignore | Filter the tables to exclude those specified. If a table name begins and ends with "/", it will be processed as a regular expression. |
| folder | Specify the output directory. |
| suffix | Suffix to the name of a generated file. (eg: `user.table.ts`) |
| camelCase | Convert all table names and their properties to camelcase. (eg: `profile_picture` becomes `profilePicture`) |
| nullish | Set schema as `nullish` instead of `nullable` |
| requiredString | Add `min(1)` for string schema |
| ssl | SSL credentials to use when connecting to server. |
| useDateType | Use a specialized Zod type for date-like fields instead of string
| overrideTypes | Override zod types for specific field types |