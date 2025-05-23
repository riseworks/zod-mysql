4.1.8
  - Add new config zodCommentTypes

4.1.7
  - Replace @zod regex with function

4.1.6
  - Throw on unsupported column types
  
4.1.5
  - Bugfix on @zod

4.1.4
  - Bugfix on @zod

4.1.3
  - Bugfix on @zod

4.1.2
  - Bugfix on @zod

4.1.1
  - Bugfix on @zod

4.1.0
  - @zod comment should override entire type

4.0.0
  - Change the @zod comment detection regex to be enclosed in parentheses

3.4.3
  - Return an array of generated file paths on generate
  
3.4.2
  - Fix generated zod import statement
  
3.4.1
  - Fix default value for strings

3.4.0
  - Add `silent` option

3.3.0
  - Shouldn't add trim() and min(1) on selectable fields
  
3.2.0
  - Add `useTrim` option 

3.1.0
  - Add @zod{} column comment detection for overriding types

3.0.0
  - Add `useDateType` option
  - Add `overrideTypes` option
  - Add `ssl` option
  - Better boolean zod schema
  - Better date-like zod schema
  - Refactored the code a lot to make TS happy
  - Add insertable, updateable and selectable schemas/types
  - Add default values when the field has it
  - Fix for nullable enum fields

2.2.0
  - Support ignoring tables with RegExp

2.1.0
  - Supports both an API and a CLI
  - Fixed the issue of different `table_name` between MySQL and MariaDB.
  - Fixed an issue where `tinyint unsigned` was returning `undefined`.

2.0.4
  - Add `requiredString` option

2.0.3
  - Exported type use camelCase as default

2.0.2
  - Fix extra line after last property

2.0.1
  - Add inferred type

2.0.0
  - Nullable as default instead of nullish
  - Add `camelCase` and `nullish` options

1.0.0
  - Initial Release
