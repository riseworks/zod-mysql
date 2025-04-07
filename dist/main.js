import k from"node:path";import b from"camelcase";import U from"fs-extra";import q from"knex";const W=/@zod\((.*)+\)/;function E(t,y,l){const{Default:m,Extra:p,Null:F,Type:h,Comment:C}=y,$=l.nullish&&l.nullish===!0,D=l.useTrim&&l.useTrim===!0&&t!=="selectable",e=m!==null&&t!=="selectable",c=["DEFAULT_GENERATED","auto_increment"].includes(p),i=F==="YES";if(c&&!i&&["insertable","updateable"].includes(t))return;const s=l.requiredString&&l.requiredString===!0&&t!=="selectable",_=l.useDateType&&l.useDateType===!0,x=h.split("(")[0].split(" ")[0],T=["z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())"],a=[D?"z.string().trim()":"z.string()"],f=["z.number()"],o=["z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean())"],j=_?T:a,z=$&&t!=="selectable"?"nullish()":"nullable()",d="optional()",v="nonnegative()",g=t==="updateable"&&!i&&!e,w="min(1)",r=C.match(W)?.[1]??null??l.overrideTypes?.[x],S=()=>{const n=r?[r]:j;return i&&!r?n.push(z):e&&n.push(d),e&&!c&&n.push(`default('${m}')`),g&&n.push(d),n.join(".")},L=()=>{const n=r?[r]:a;return i&&!r?n.push(z):e?n.push(d):s&&!r&&n.push(w),e&&!c&&n.push(`default('${m}')`),g&&n.push(d),n.join(".")},N=()=>{const n=r?[r]:o;return i&&!r?n.push(z):e&&n.push(d),e&&!c&&n.push(`default(${!!+m})`),g&&n.push(d),n.join(".")},O=()=>{const n=h.endsWith(" unsigned"),u=r?[r]:f;return n&&!r&&u.push(v),i&&!r?u.push(z):e&&u.push(d),e&&!c&&u.push(`default(${m})`),g&&u.push(d),u.join(".")},R=()=>{const u=[`z.enum([${h.replace("enum(","").replace(")","").replace(/,/g,",")}])`];return i?u.push(z):e&&u.push(d),e&&!c&&u.push(`default('${m}')`),g&&u.push(d),u.join(".")};switch(x){case"date":case"datetime":case"timestamp":return S();case"tinytext":case"text":case"mediumtext":case"longtext":case"json":case"decimal":case"time":case"year":case"char":case"varchar":return L();case"tinyint":return N();case"smallint":case"mediumint":case"int":case"bigint":case"float":case"double":return O();case"enum":return R();default:throw new Error(`Unsupported column type: ${x}`)}}async function H(t){const y=q({client:"mysql2",connection:{host:t.host,port:t.port,user:t.user,password:t.password,database:t.database,ssl:t.ssl}}),l=t.camelCase&&t.camelCase===!0;let p=(await y.raw("SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?",[t.database]))[0].map(e=>e.table_name).sort();const F=[],h=t.tables;h?.length&&(p=p.filter(e=>h.includes(e)));const C=t.ignore,$=C?.filter(e=>e.startsWith("/")&&e.endsWith("/")),D=C?.filter(e=>!$?.includes(e));D?.length&&(p=p.filter(e=>!D.includes(e))),$?.length&&(p=p.filter(e=>{let c=!0;for(const i of $){const s=i.substring(1,i.length-1);e.match(s)!==null&&(c=!1)}return c}));for(let e of p){const i=(await y.raw(`SHOW FULL COLUMNS FROM ${e}`))[0];l&&(e=b(e));let s=`import { z } from 'zod'

export const ${e} = z.object({`;for(const a of i){const f=l?b(a.Field):a.Field,o=E("table",a,t);o&&(s=`${s}
	${f}: ${o},`)}s=`${s}
})

export const insertable_${e} = z.object({`;for(const a of i){const f=l?b(a.Field):a.Field,o=E("insertable",a,t);o&&(s=`${s}
  ${f}: ${o},`)}s=`${s}
})

export const updateable_${e} = z.object({`;for(const a of i){const f=l?b(a.Field):a.Field,o=E("updateable",a,t);o&&(s=`${s}
  ${f}: ${o},`)}s=`${s}
})

export const selectable_${e} = z.object({`;for(const a of i){const f=l?b(a.Field):a.Field,o=E("selectable",a,t);o&&(s=`${s}
  ${f}: ${o},`)}s=`${s}
})

export type ${b(`${e}Type`,{pascalCase:!0})} = z.infer<typeof ${e}>
export type Insertable${b(`${e}Type`,{pascalCase:!0})} = z.infer<typeof insertable_${e}>
export type Updateable${b(`${e}Type`,{pascalCase:!0})} = z.infer<typeof updateable_${e}>
export type Selectable${b(`${e}Type`,{pascalCase:!0})} = z.infer<typeof selectable_${e}>
`;const _=t.folder&&t.folder!==""?t.folder:".",x=t.suffix&&t.suffix!==""?`${e}.${t.suffix}.ts`:`${e}.ts`,T=k.join(_,x);F.push(T),t.silent||console.log("Created:",T),U.outputFileSync(T,s)}return await y.destroy(),F}export{H as generate,E as getType};
