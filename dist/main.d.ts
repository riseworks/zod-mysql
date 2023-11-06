export declare function generate(config: Config): Promise<void>;
type ValidTypes = 'date' | 'datetime' | 'timestamp' | 'time' | 'year' | 'char' | 'varchar' | 'tinytext' | 'text' | 'mediumtext' | 'longtext' | 'json' | 'decimal' | 'tinyint' | 'smallint' | 'mediumint' | 'int' | 'bigint' | 'float' | 'double';
export interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    tables?: string[];
    ignore?: string[];
    folder?: string;
    suffix?: string;
    camelCase?: boolean;
    nullish?: boolean;
    requiredString?: boolean;
    useDateType?: boolean;
    ssl?: Record<string, any>;
    overrideTypes?: Record<ValidTypes, string>;
}
export {};
