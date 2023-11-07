import U from"node:path";import m from"camelcase";import q from"fs-extra";import W from"knex";function _(t,g,l){const{Default:h,Extra:d,Null:T,Type:y,Comment:$}=g,F=l.nullish&&l.nullish===!0,e=h!==null&&t!=="selectable",c=["DEFAULT_GENERATED","auto_increment"].includes(d),i=T==="YES";if(c&&!i&&["insertable","updateable"].includes(t))return;const s=l.requiredString&&l.requiredString===!0,E=l.useDateType&&l.useDateType===!0,p=y.split("(")[0].split(" ")[0],C=["z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())"],a=["z.string()"],f=["z.number()"],r=["z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean())"],v=E?C:a,x=F&&t!=="selectable"?"nullish()":"nullable()",u="optional()",S="nonnegative()",z=t==="updateable"&&!i&&!e,L="min(1)",j=/@zod{(.*)+}/,b=j.test($)?$.match(j)?.[1]:l.overrideTypes?.[p],w=D=>{const n=b?[b]:v;return i?n.push(x):e&&n.push(u),e&&!c&&n.push(`default('${h}')`),z&&n.push(u),n.join(".")},N=D=>{const n=b?[b]:a;return i?n.push(x):s?n.push(L):e&&n.push(u),e&&!c&&n.push(`default('${h}')`),z&&n.push(u),n.join(".")},O=D=>{const n=b?[b]:r;return i?n.push(x):e&&n.push(u),e&&!c&&n.push(`default(${!!+h})`),z&&n.push(u),n.join(".")},R=D=>{const n=y.endsWith(" unsigned"),o=b?[b]:f;return n&&o.push(S),i?o.push(x):e&&o.push(u),e&&!c&&o.push(`default(${h})`),z&&o.push(u),o.join(".")},k=D=>{const o=[`z.enum([${y.replace("enum(","").replace(")","").replace(/,/g,",")}])`];return i?o.push(x):e&&o.push(u),e&&!c&&o.push(`default('${h}')`),z&&o.push(u),o.join(".")};switch(p){case"date":case"datetime":case"timestamp":return w(p);case"tinytext":case"text":case"mediumtext":case"longtext":case"json":case"decimal":case"time":case"year":case"char":case"varchar":return N(p);case"tinyint":return O(p);case"smallint":case"mediumint":case"int":case"bigint":case"float":case"double":return R(p);case"enum":return k(p)}}async function H(t){const g=W({client:"mysql2",connection:{host:t.host,port:t.port,user:t.user,password:t.password,database:t.database,ssl:t.ssl}}),l=t.camelCase&&t.camelCase===!0;let d=(await g.raw("SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?",[t.database]))[0].map(e=>e.table_name).sort();const T=t.tables;T?.length&&(d=d.filter(e=>T.includes(e)));const y=t.ignore,$=y?.filter(e=>e.startsWith("/")&&e.endsWith("/")),F=y?.filter(e=>!$?.includes(e));F?.length&&(d=d.filter(e=>!F.includes(e))),$?.length&&(d=d.filter(e=>{let c=!0;for(const i of $){const s=i.substring(1,i.length-1);e.match(s)!==null&&(c=!1)}return c}));for(let e of d){const i=(await g.raw(`SHOW FULL COLUMNS FROM ${e}`))[0];l&&(e=m(e));let s=`import z from 'zod'

export const ${e} = z.object({`;for(const a of i){const f=l?m(a.Field):a.Field,r=_("table",a,t);r&&(s=`${s}
	${f}: ${r},`)}s=`${s}
})

export const insertable_${e} = z.object({`;for(const a of i){const f=l?m(a.Field):a.Field,r=_("insertable",a,t);r&&(s=`${s}
  ${f}: ${r},`)}s=`${s}
})

export const updateable_${e} = z.object({`;for(const a of i){const f=l?m(a.Field):a.Field,r=_("updateable",a,t);r&&(s=`${s}
  ${f}: ${r},`)}s=`${s}
})

export const selectable_${e} = z.object({`;for(const a of i){const f=l?m(a.Field):a.Field,r=_("selectable",a,t);r&&(s=`${s}
  ${f}: ${r},`)}s=`${s}
})

export type ${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof ${e}>
export type Insertable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof insertable_${e}>
export type Updateable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof updateable_${e}>
export type Selectable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof selectable_${e}>
`;const E=t.folder&&t.folder!==""?t.folder:".",p=t.suffix&&t.suffix!==""?`${e}.${t.suffix}.ts`:`${e}.ts`,C=U.join(E,p);console.log("Created:",C),q.outputFileSync(C,s)}await g.destroy()}export{H as generate,_ as getType};
