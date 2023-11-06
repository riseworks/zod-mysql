import { describe, test } from 'vitest'
import { type Config, type Desc, getType } from './main'

describe('getType', () => {
	const config: Config = {
		database: 'rise',
		camelCase: true,
		host: 'localhost',
		password: 'password',
		port: 3306,
		user: 'root',
		nullish: true,
		requiredString: true,
		useDateType: true,
	}

	test('should return a custom Zod date field for date, datetime, and timestamp types', ({
		expect,
	}) => {
		const desc: Desc = {
			Default: null,
			Extra: '',
			Null: 'NO',
			Type: 'date',
			Field: 'date',
		}
		const result = getType('table', desc, config)
		expect(result).toEqual(
			'z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())',
		)
	})

	test('should return a Zod string field for text, mediumtext, longtext, json, decimal, time, year, char, and varchar types', ({
		expect,
	}) => {
		const desc: Desc = {
			Default: null,
			Extra: '',
			Null: 'NO' as const,
			Type: 'varchar(255)',
			Field: 'varchar',
		}
		const result = getType('table', desc, config)
		expect(result).toEqual('z.string().min(1)')
	})

	test('should return a custom Zod boolean field for tinyint types', ({
		expect,
	}) => {
		const desc: Desc = {
			Default: '0',
			Extra: '',
			Null: 'NO',
			Field: 'tinyint',
			Type: 'tinyint(1)',
		}
		const result = getType('table', desc, config)
		expect(result).toEqual(
			'z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean()).optional().default(false)',
		)
	})

	test('should return a Zod number field for smallint, mediumint, int, bigint, float, and double types', ({
		expect,
	}) => {
		const desc: Desc = {
			Default: '0',
			Extra: '',
			Null: 'NO',
			Field: 'int',
			Type: 'int(11)',
		}
		const result = getType('table', desc, config)
		expect(result).toEqual('z.number().optional().default(0)')
	})

	test('should return a Zod enum field for enum types', ({ expect }) => {
		const desc: Desc = {
			Default: 'foo',
			Extra: '',
			Null: 'NO',
			Field: 'enum',
			Type: "enum('foo', 'bar', 'baz')",
		}
		const result = getType('table', desc, config)
		expect(result).toEqual(
			"z.enum(['foo', 'bar', 'baz']).optional().default('foo')",
		)
	})

	test('should return undefined for insertable and updateable fields that are not null and have a default value', ({
		expect,
	}) => {
		const desc: Desc = {
			Default: 'CURRENT_TIMESTAMP',
			Extra: 'DEFAULT_GENERATED',
			Null: 'NO',
			Field: 'timestamp',
			Type: 'timestamp',
		}
		let result = getType('insertable', desc, config)
		expect(result).toEqual(undefined)
		result = getType('updateable', desc, config)
		expect(result).toEqual(undefined)
	})
})
