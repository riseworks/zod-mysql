import k from"node:path";import m from"camelcase";import q from"fs-extra";import U from"knex";function E(t,g,l){const{Default:y,Extra:p,Null:C,Type:$}=g,x=l.nullish&&l.nullish===!0,i=y!==null&&t!=="selectable",e=["DEFAULT_GENERATED","auto_increment"].includes(p),u=C==="YES";if(e&&!u&&["insertable","updateable"].includes(t))return;const d=l.requiredString&&l.requiredString===!0,s=l.useDateType&&l.useDateType===!0,f=$.split("(")[0].split(" ")[0],_=["z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())"],z=["z.string()"],n=["z.number()"],b=["z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean())"],r=s?_:z,T=x&&t!=="selectable"?"nullish()":"nullable()",c="optional()",j="nonnegative()",F=t==="updateable"&&!u&&!i,S="min(1)",h=l.overrideTypes?.[f],v=D=>{const a=h?[h]:r;return u?a.push(T):i&&a.push(c),i&&!e&&a.push(`default('${y}')`),F&&a.push(c),a.join(".")},w=D=>{const a=h?[h]:z;return u?a.push(T):d?a.push(S):i&&a.push(c),i&&!e&&a.push(`default('${y}')`),F&&a.push(c),a.join(".")},N=D=>{const a=h?[h]:b;return u?a.push(T):i&&a.push(c),i&&!e&&a.push(`default(${!!+y})`),F&&a.push(c),a.join(".")},L=D=>{const a=$.endsWith(" unsigned"),o=h?[h]:n;return a&&o.push(j),u?o.push(T):i&&o.push(c),i&&!e&&o.push(`default(${y})`),F&&o.push(c),o.join(".")},R=D=>{const o=[`z.enum([${$.replace("enum(","").replace(")","").replace(/,/g,", ")}])`];return u?o.push(T):i&&o.push(c),i&&!e&&o.push(`default('${y}')`),F&&o.push(c),o.join(".")};switch(f){case"date":case"datetime":case"timestamp":return v(f);case"tinytext":case"text":case"mediumtext":case"longtext":case"json":case"decimal":case"time":case"year":case"char":case"varchar":return w(f);case"tinyint":return N(f);case"smallint":case"mediumint":case"int":case"bigint":case"float":case"double":return L(f);case"enum":return R(f)}}async function B(t){const g=U({client:"mysql2",connection:{host:t.host,port:t.port,user:t.user,password:t.password,database:t.database,ssl:t.ssl}}),l=t.camelCase&&t.camelCase===!0;let p=(await g.raw("SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?",[t.database]))[0].map(e=>e.table_name).sort();const C=t.tables;C?.length&&(p=p.filter(e=>C.includes(e)));const $=t.ignore,x=$?.filter(e=>e.startsWith("/")&&e.endsWith("/")),i=$?.filter(e=>!x?.includes(e));i?.length&&(p=p.filter(e=>!i.includes(e))),x?.length&&(p=p.filter(e=>{let u=!0;for(const d of x){const s=d.substring(1,d.length-1);e.match(s)!==null&&(u=!1)}return u}));for(let e of p){const d=(await g.raw(`DESC ${e}`))[0];l&&(e=m(e));let s=`import z from 'zod'

export const ${e} = z.object({`;for(const n of d){const b=l?m(n.Field):n.Field,r=E("table",n,t);r&&(s=`${s}
	${b}: ${r},`)}s=`${s}
})

export const insertable_${e} = z.object({`;for(const n of d){const b=l?m(n.Field):n.Field,r=E("insertable",n,t);r&&(s=`${s}
  ${b}: ${r},`)}s=`${s}
})

export const updateable_${e} = z.object({`;for(const n of d){const b=l?m(n.Field):n.Field,r=E("updateable",n,t);r&&(s=`${s}
  ${b}: ${r},`)}s=`${s}
})

export const selectable_${e} = z.object({`;for(const n of d){const b=l?m(n.Field):n.Field,r=E("selectable",n,t);r&&(s=`${s}
  ${b}: ${r},`)}s=`${s}
})

export type ${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof ${e}>
export type Insertable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof insertable_${e}>
export type Updateable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof updateable_${e}>
export type Selectable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof selectable_${e}>
`;const f=t.folder&&t.folder!==""?t.folder:".",_=t.suffix&&t.suffix!==""?`${e}.${t.suffix}.ts`:`${e}.ts`,z=k.join(f,_);console.log("Created:",z),q.outputFileSync(z,s)}await g.destroy()}export{B as generate};
