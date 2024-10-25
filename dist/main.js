import q from"node:path";import m from"camelcase";import W from"fs-extra";import V from"knex";function E(t,$,i){const{Default:h,Extra:d,Null:C,Type:y,Comment:g}=$,x=i.nullish&&i.nullish===!0,D=i.useTrim&&i.useTrim===!0&&t!=="selectable",e=h!==null&&t!=="selectable",u=["DEFAULT_GENERATED","auto_increment"].includes(d),l=C==="YES";if(u&&!l&&["insertable","updateable"].includes(t))return;const s=i.requiredString&&i.requiredString===!0&&t!=="selectable",j=i.useDateType&&i.useDateType===!0,p=y.split("(")[0].split(" ")[0],T=["z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())"],a=[D?"z.string().trim()":"z.string()"],f=["z.number()"],r=["z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean())"],S=j?T:a,z=x&&t!=="selectable"?"nullish()":"nullable()",c="optional()",L="nonnegative()",F=t==="updateable"&&!l&&!e,w="min(1)",v=/@zod{(.*)+}/,b=v.test(g)?g.match(v)?.[1]:i.overrideTypes?.[p],N=_=>{const n=b?[b]:S;return l?n.push(z):e&&n.push(c),e&&!u&&n.push(`default('${h}')`),F&&n.push(c),n.join(".")},O=_=>{const n=b?[b]:a;return l?n.push(z):e?n.push(c):s&&n.push(w),e&&!u&&n.push(`default('${h}')`),F&&n.push(c),n.join(".")},R=_=>{const n=b?[b]:r;return l?n.push(z):e&&n.push(c),e&&!u&&n.push(`default(${!!+h})`),F&&n.push(c),n.join(".")},k=_=>{const n=y.endsWith(" unsigned"),o=b?[b]:f;return n&&o.push(L),l?o.push(z):e&&o.push(c),e&&!u&&o.push(`default(${h})`),F&&o.push(c),o.join(".")},U=_=>{const o=[`z.enum([${y.replace("enum(","").replace(")","").replace(/,/g,",")}])`];return l?o.push(z):e&&o.push(c),e&&!u&&o.push(`default('${h}')`),F&&o.push(c),o.join(".")};switch(p){case"date":case"datetime":case"timestamp":return N(p);case"tinytext":case"text":case"mediumtext":case"longtext":case"json":case"decimal":case"time":case"year":case"char":case"varchar":return O(p);case"tinyint":return R(p);case"smallint":case"mediumint":case"int":case"bigint":case"float":case"double":return k(p);case"enum":return U(p)}}async function I(t){const $=V({client:"mysql2",connection:{host:t.host,port:t.port,user:t.user,password:t.password,database:t.database,ssl:t.ssl}}),i=t.camelCase&&t.camelCase===!0;let d=(await $.raw("SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?",[t.database]))[0].map(e=>e.table_name).sort();const C=[],y=t.tables;y?.length&&(d=d.filter(e=>y.includes(e)));const g=t.ignore,x=g?.filter(e=>e.startsWith("/")&&e.endsWith("/")),D=g?.filter(e=>!x?.includes(e));D?.length&&(d=d.filter(e=>!D.includes(e))),x?.length&&(d=d.filter(e=>{let u=!0;for(const l of x){const s=l.substring(1,l.length-1);e.match(s)!==null&&(u=!1)}return u}));for(let e of d){const l=(await $.raw(`SHOW FULL COLUMNS FROM ${e}`))[0];i&&(e=m(e));let s=`import { z } from 'zod'

export const ${e} = z.object({`;for(const a of l){const f=i?m(a.Field):a.Field,r=E("table",a,t);r&&(s=`${s}
	${f}: ${r},`)}s=`${s}
})

export const insertable_${e} = z.object({`;for(const a of l){const f=i?m(a.Field):a.Field,r=E("insertable",a,t);r&&(s=`${s}
  ${f}: ${r},`)}s=`${s}
})

export const updateable_${e} = z.object({`;for(const a of l){const f=i?m(a.Field):a.Field,r=E("updateable",a,t);r&&(s=`${s}
  ${f}: ${r},`)}s=`${s}
})

export const selectable_${e} = z.object({`;for(const a of l){const f=i?m(a.Field):a.Field,r=E("selectable",a,t);r&&(s=`${s}
  ${f}: ${r},`)}s=`${s}
})

export type ${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof ${e}>
export type Insertable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof insertable_${e}>
export type Updateable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof updateable_${e}>
export type Selectable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof selectable_${e}>
`;const j=t.folder&&t.folder!==""?t.folder:".",p=t.suffix&&t.suffix!==""?`${e}.${t.suffix}.ts`:`${e}.ts`,T=q.join(j,p);C.push(T),t.silent||console.log("Created:",T),W.outputFileSync(T,s)}return await $.destroy(),C}export{I as generate,E as getType};
