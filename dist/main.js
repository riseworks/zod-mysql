import R from"node:path";import b from"camelcase";import U from"fs-extra";import q from"knex";function _(t,y,l){const{Default:m,Extra:p,Null:g,Type:h,Comment:F}=y,$=l.nullish&&l.nullish===!0,C=l.useTrim&&l.useTrim===!0&&t!=="selectable",e=m!==null&&t!=="selectable",c=["DEFAULT_GENERATED","auto_increment"].includes(p),i=g==="YES";if(c&&!i&&["insertable","updateable"].includes(t))return;const s=l.requiredString&&l.requiredString===!0&&t!=="selectable",E=l.useDateType&&l.useDateType===!0,D=h.split("(")[0].split(" ")[0],T=["z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())"],a=[C?"z.string().trim()":"z.string()"],f=["z.number()"],o=["z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean())"],j=E?T:a,x=$&&t!=="selectable"?"nullish()":"nullable()",d="optional()",v="nonnegative()",z=t==="updateable"&&!i&&!e,S="min(1)",r=F.match(/@zod\((.*)+\)/)?.[1]??null??l.overrideTypes?.[D],L=()=>{const n=r?[r]:j;return i&&!r?n.push(x):e&&n.push(d),e&&!c&&n.push(`default('${m}')`),z&&n.push(d),n.join(".")},w=()=>{const n=r?[r]:a;return i&&!r?n.push(x):e?n.push(d):s&&!r&&n.push(S),e&&!c&&n.push(`default('${m}')`),z&&n.push(d),n.join(".")},N=()=>{const n=r?[r]:o;return i&&!r?n.push(x):e&&n.push(d),e&&!c&&n.push(`default(${!!+m})`),z&&n.push(d),n.join(".")},O=()=>{const n=h.endsWith(" unsigned"),u=r?[r]:f;return n&&!r&&u.push(v),i&&!r?u.push(x):e&&u.push(d),e&&!c&&u.push(`default(${m})`),z&&u.push(d),u.join(".")},k=()=>{const u=[`z.enum([${h.replace("enum(","").replace(")","").replace(/,/g,",")}])`];return i?u.push(x):e&&u.push(d),e&&!c&&u.push(`default('${m}')`),z&&u.push(d),u.join(".")};switch(D){case"date":case"datetime":case"timestamp":return L();case"tinytext":case"text":case"mediumtext":case"longtext":case"json":case"decimal":case"time":case"year":case"char":case"varchar":return w();case"tinyint":return N();case"smallint":case"mediumint":case"int":case"bigint":case"float":case"double":return O();case"enum":return k()}}async function G(t){const y=q({client:"mysql2",connection:{host:t.host,port:t.port,user:t.user,password:t.password,database:t.database,ssl:t.ssl}}),l=t.camelCase&&t.camelCase===!0;let p=(await y.raw("SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?",[t.database]))[0].map(e=>e.table_name).sort();const g=[],h=t.tables;h?.length&&(p=p.filter(e=>h.includes(e)));const F=t.ignore,$=F?.filter(e=>e.startsWith("/")&&e.endsWith("/")),C=F?.filter(e=>!$?.includes(e));C?.length&&(p=p.filter(e=>!C.includes(e))),$?.length&&(p=p.filter(e=>{let c=!0;for(const i of $){const s=i.substring(1,i.length-1);e.match(s)!==null&&(c=!1)}return c}));for(let e of p){const i=(await y.raw(`SHOW FULL COLUMNS FROM ${e}`))[0];l&&(e=b(e));let s=`import { z } from 'zod'

export const ${e} = z.object({`;for(const a of i){const f=l?b(a.Field):a.Field,o=_("table",a,t);o&&(s=`${s}
	${f}: ${o},`)}s=`${s}
})

export const insertable_${e} = z.object({`;for(const a of i){const f=l?b(a.Field):a.Field,o=_("insertable",a,t);o&&(s=`${s}
  ${f}: ${o},`)}s=`${s}
})

export const updateable_${e} = z.object({`;for(const a of i){const f=l?b(a.Field):a.Field,o=_("updateable",a,t);o&&(s=`${s}
  ${f}: ${o},`)}s=`${s}
})

export const selectable_${e} = z.object({`;for(const a of i){const f=l?b(a.Field):a.Field,o=_("selectable",a,t);o&&(s=`${s}
  ${f}: ${o},`)}s=`${s}
})

export type ${b(`${e}Type`,{pascalCase:!0})} = z.infer<typeof ${e}>
export type Insertable${b(`${e}Type`,{pascalCase:!0})} = z.infer<typeof insertable_${e}>
export type Updateable${b(`${e}Type`,{pascalCase:!0})} = z.infer<typeof updateable_${e}>
export type Selectable${b(`${e}Type`,{pascalCase:!0})} = z.infer<typeof selectable_${e}>
`;const E=t.folder&&t.folder!==""?t.folder:".",D=t.suffix&&t.suffix!==""?`${e}.${t.suffix}.ts`:`${e}.ts`,T=R.join(E,D);g.push(T),t.silent||console.log("Created:",T),U.outputFileSync(T,s)}return await y.destroy(),g}export{G as generate,_ as getType};
