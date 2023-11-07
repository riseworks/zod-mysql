export declare function getType(op: 'table' | 'insertable' | 'updateable' | 'selectable', desc: Desc, config: Config): string;
export declare function generate(config: Config): Promise<void>;
type ValidTypes = 'date' | 'datetime' | 'timestamp' | 'time' | 'year' | 'char' | 'varchar' | 'tinytext' | 'text' | 'mediumtext' | 'longtext' | 'json' | 'decimal' | 'tinyint' | 'smallint' | 'mediumint' | 'int' | 'bigint' | 'float' | 'double';
export interface Desc {
    Field: string;
    Default: string | null;
    Extra: string;
    Type: string;
    Null: 'YES' | 'NO';
    Comment: string;
}
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
    overrideTypes?: {
        [k in ValidTypes]?: string;
    };
}
export {};
