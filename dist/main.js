import q from"node:path";import m from"camelcase";import W from"fs-extra";import V from"knex";function D(t,g,i){const{Default:h,Extra:f,Null:z,Type:y,Comment:$}=g,F=i.nullish&&i.nullish===!0,e=i.useTrim&&i.useTrim===!0&&t!=="selectable",l=h!==null&&t!=="selectable",r=["DEFAULT_GENERATED","auto_increment"].includes(f),s=z==="YES";if(r&&!s&&["insertable","updateable"].includes(t))return;const _=i.requiredString&&i.requiredString===!0&&t!=="selectable",E=i.useDateType&&i.useDateType===!0,c=y.split("(")[0].split(" ")[0],a=["z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())"],d=[e?"z.string().trim()":"z.string()"],o=["z.number()"],v=["z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean())"],S=E?a:d,x=F&&t!=="selectable"?"nullish()":"nullable()",p="optional()",L="nonnegative()",T=t==="updateable"&&!s&&!l,w="min(1)",j=/@zod{(.*)+}/,b=j.test($)?$.match(j)?.[1]:i.overrideTypes?.[c],N=C=>{const n=b?[b]:S;return s?n.push(x):l&&n.push(p),l&&!r&&n.push(`default('${h}')`),T&&n.push(p),n.join(".")},O=C=>{const n=b?[b]:d;return s?n.push(x):l?n.push(p):_&&n.push(w),l&&!r&&n.push(`default('${h}')`),T&&n.push(p),n.join(".")},R=C=>{const n=b?[b]:v;return s?n.push(x):l&&n.push(p),l&&!r&&n.push(`default(${!!+h})`),T&&n.push(p),n.join(".")},k=C=>{const n=y.endsWith(" unsigned"),u=b?[b]:o;return n&&u.push(L),s?u.push(x):l&&u.push(p),l&&!r&&u.push(`default(${h})`),T&&u.push(p),u.join(".")},U=C=>{const u=[`z.enum([${y.replace("enum(","").replace(")","").replace(/,/g,",")}])`];return s?u.push(x):l&&u.push(p),l&&!r&&u.push(`default('${h}')`),T&&u.push(p),u.join(".")};switch(c){case"date":case"datetime":case"timestamp":return N(c);case"tinytext":case"text":case"mediumtext":case"longtext":case"json":case"decimal":case"time":case"year":case"char":case"varchar":return O(c);case"tinyint":return R(c);case"smallint":case"mediumint":case"int":case"bigint":case"float":case"double":return k(c);case"enum":return U(c)}}async function I(t){const g=V({client:"mysql2",connection:{host:t.host,port:t.port,user:t.user,password:t.password,database:t.database,ssl:t.ssl}}),i=t.camelCase&&t.camelCase===!0;let f=(await g.raw("SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?",[t.database]))[0].map(e=>e.table_name).sort();const z=t.tables;z?.length&&(f=f.filter(e=>z.includes(e)));const y=t.ignore,$=y?.filter(e=>e.startsWith("/")&&e.endsWith("/")),F=y?.filter(e=>!$?.includes(e));F?.length&&(f=f.filter(e=>!F.includes(e))),$?.length&&(f=f.filter(e=>{let l=!0;for(const r of $){const s=r.substring(1,r.length-1);e.match(s)!==null&&(l=!1)}return l}));for(let e of f){const r=(await g.raw(`SHOW FULL COLUMNS FROM ${e}`))[0];i&&(e=m(e));let s=`import { z } from 'zod'

export const ${e} = z.object({`;for(const a of r){const d=i?m(a.Field):a.Field,o=D("table",a,t);o&&(s=`${s}
	${d}: ${o},`)}s=`${s}
})

export const insertable_${e} = z.object({`;for(const a of r){const d=i?m(a.Field):a.Field,o=D("insertable",a,t);o&&(s=`${s}
  ${d}: ${o},`)}s=`${s}
})

export const updateable_${e} = z.object({`;for(const a of r){const d=i?m(a.Field):a.Field,o=D("updateable",a,t);o&&(s=`${s}
  ${d}: ${o},`)}s=`${s}
})

export const selectable_${e} = z.object({`;for(const a of r){const d=i?m(a.Field):a.Field,o=D("selectable",a,t);o&&(s=`${s}
  ${d}: ${o},`)}s=`${s}
})

export type ${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof ${e}>
export type Insertable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof insertable_${e}>
export type Updateable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof updateable_${e}>
export type Selectable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof selectable_${e}>
`;const _=t.folder&&t.folder!==""?t.folder:".",E=t.suffix&&t.suffix!==""?`${e}.${t.suffix}.ts`:`${e}.ts`,c=q.join(_,E);t.silent||console.log("Created:",c),W.outputFileSync(c,s)}await g.destroy()}export{I as generate,D as getType};
