import q from"node:path";import m from"camelcase";import W from"fs-extra";import V from"knex";function D(s,g,i){const{Default:h,Extra:f,Null:z,Type:y,Comment:$}=g,F=i.nullish&&i.nullish===!0,e=i.useTrim&&i.useTrim===!0,r=h!==null&&s!=="selectable",l=["DEFAULT_GENERATED","auto_increment"].includes(f),t=z==="YES";if(l&&!t&&["insertable","updateable"].includes(s))return;const _=i.requiredString&&i.requiredString===!0,E=i.useDateType&&i.useDateType===!0,c=y.split("(")[0].split(" ")[0],a=["z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())"],d=[e?"z.string().trim()":"z.string()"],o=["z.number()"],v=["z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean())"],S=E?a:d,x=F&&s!=="selectable"?"nullish()":"nullable()",p="optional()",L="nonnegative()",T=s==="updateable"&&!t&&!r,w="min(1)",j=/@zod{(.*)+}/,b=j.test($)?$.match(j)?.[1]:i.overrideTypes?.[c],N=C=>{const n=b?[b]:S;return t?n.push(x):r&&n.push(p),r&&!l&&n.push(`default('${h}')`),T&&n.push(p),n.join(".")},O=C=>{const n=b?[b]:d;return t?n.push(x):_?n.push(w):r&&n.push(p),r&&!l&&n.push(`default('${h}')`),T&&n.push(p),n.join(".")},R=C=>{const n=b?[b]:v;return t?n.push(x):r&&n.push(p),r&&!l&&n.push(`default(${!!+h})`),T&&n.push(p),n.join(".")},k=C=>{const n=y.endsWith(" unsigned"),u=b?[b]:o;return n&&u.push(L),t?u.push(x):r&&u.push(p),r&&!l&&u.push(`default(${h})`),T&&u.push(p),u.join(".")},U=C=>{const u=[`z.enum([${y.replace("enum(","").replace(")","").replace(/,/g,",")}])`];return t?u.push(x):r&&u.push(p),r&&!l&&u.push(`default('${h}')`),T&&u.push(p),u.join(".")};switch(c){case"date":case"datetime":case"timestamp":return N(c);case"tinytext":case"text":case"mediumtext":case"longtext":case"json":case"decimal":case"time":case"year":case"char":case"varchar":return O(c);case"tinyint":return R(c);case"smallint":case"mediumint":case"int":case"bigint":case"float":case"double":return k(c);case"enum":return U(c)}}async function I(s){const g=V({client:"mysql2",connection:{host:s.host,port:s.port,user:s.user,password:s.password,database:s.database,ssl:s.ssl}}),i=s.camelCase&&s.camelCase===!0;let f=(await g.raw("SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?",[s.database]))[0].map(e=>e.table_name).sort();const z=s.tables;z?.length&&(f=f.filter(e=>z.includes(e)));const y=s.ignore,$=y?.filter(e=>e.startsWith("/")&&e.endsWith("/")),F=y?.filter(e=>!$?.includes(e));F?.length&&(f=f.filter(e=>!F.includes(e))),$?.length&&(f=f.filter(e=>{let r=!0;for(const l of $){const t=l.substring(1,l.length-1);e.match(t)!==null&&(r=!1)}return r}));for(let e of f){const l=(await g.raw(`SHOW FULL COLUMNS FROM ${e}`))[0];i&&(e=m(e));let t=`import z from 'zod'

export const ${e} = z.object({`;for(const a of l){const d=i?m(a.Field):a.Field,o=D("table",a,s);o&&(t=`${t}
	${d}: ${o},`)}t=`${t}
})

export const insertable_${e} = z.object({`;for(const a of l){const d=i?m(a.Field):a.Field,o=D("insertable",a,s);o&&(t=`${t}
  ${d}: ${o},`)}t=`${t}
})

export const updateable_${e} = z.object({`;for(const a of l){const d=i?m(a.Field):a.Field,o=D("updateable",a,s);o&&(t=`${t}
  ${d}: ${o},`)}t=`${t}
})

export const selectable_${e} = z.object({`;for(const a of l){const d=i?m(a.Field):a.Field,o=D("selectable",a,s);o&&(t=`${t}
  ${d}: ${o},`)}t=`${t}
})

export type ${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof ${e}>
export type Insertable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof insertable_${e}>
export type Updateable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof updateable_${e}>
export type Selectable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof selectable_${e}>
`;const _=s.folder&&s.folder!==""?s.folder:".",E=s.suffix&&s.suffix!==""?`${e}.${s.suffix}.ts`:`${e}.ts`,c=q.join(_,E);console.log("Created:",c),W.outputFileSync(c,t)}await g.destroy()}export{I as generate,D as getType};
