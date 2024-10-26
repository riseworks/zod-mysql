import U from"node:path";import m from"camelcase";import q from"fs-extra";import W from"knex";function E(t,x,i){const{Default:$,Extra:f,Null:F,Type:y,Comment:C}=x,T=i.nullish&&i.nullish===!0,D=i.useTrim&&i.useTrim===!0&&t!=="selectable",e=$!==null&&t!=="selectable",c=["DEFAULT_GENERATED","auto_increment"].includes(f),l=F==="YES";if(c&&!l&&["insertable","updateable"].includes(t))return;const s=i.requiredString&&i.requiredString===!0&&t!=="selectable",j=i.useDateType&&i.useDateType===!0,_=y.split("(")[0].split(" ")[0],g=["z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())"],a=[D?"z.string().trim()":"z.string()"],b=["z.number()"],o=["z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean())"],S=j?g:a,z=T&&t!=="selectable"?"nullish()":"nullable()",p="optional()",v="nonnegative()",d=t==="updateable"&&!l&&!e,L="min(1)",r=C.match(/@zod\((.*)+\)/)?.[1]??null,h=i.overrideTypes?.[_],w=()=>{if(r)return d?r:`${r}.optional()`;const n=h?[h]:S;return l?n.push(z):e&&n.push(p),e&&!c&&n.push(`default('${$}')`),d&&n.push(p),n.join(".")},N=()=>{if(r)return d?`${r}.optional()`:r;const n=h?[h]:a;return l?n.push(z):e?n.push(p):s&&n.push(L),e&&!c&&n.push(`default('${$}')`),d&&n.push(p),n.join(".")},k=()=>{if(r)return d?`${r}.optional()`:r;const n=h?[h]:o;return l?n.push(z):e&&n.push(p),e&&!c&&n.push(`default(${!!+$})`),d&&n.push(p),n.join(".")},O=()=>{if(r)return d?`${r}.optional()`:r;const n=y.endsWith(" unsigned"),u=h?[h]:b;return n&&u.push(v),l?u.push(z):e&&u.push(p),e&&!c&&u.push(`default(${$})`),d&&u.push(p),u.join(".")},R=()=>{if(r)return d?`${r}.optional()`:r;const u=[`z.enum([${y.replace("enum(","").replace(")","").replace(/,/g,",")}])`];return l?u.push(z):e&&u.push(p),e&&!c&&u.push(`default('${$}')`),d&&u.push(p),u.join(".")};switch(_){case"date":case"datetime":case"timestamp":return w();case"tinytext":case"text":case"mediumtext":case"longtext":case"json":case"decimal":case"time":case"year":case"char":case"varchar":return N();case"tinyint":return k();case"smallint":case"mediumint":case"int":case"bigint":case"float":case"double":return O();case"enum":return R()}}async function G(t){const x=W({client:"mysql2",connection:{host:t.host,port:t.port,user:t.user,password:t.password,database:t.database,ssl:t.ssl}}),i=t.camelCase&&t.camelCase===!0;let f=(await x.raw("SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?",[t.database]))[0].map(e=>e.table_name).sort();const F=[],y=t.tables;y?.length&&(f=f.filter(e=>y.includes(e)));const C=t.ignore,T=C?.filter(e=>e.startsWith("/")&&e.endsWith("/")),D=C?.filter(e=>!T?.includes(e));D?.length&&(f=f.filter(e=>!D.includes(e))),T?.length&&(f=f.filter(e=>{let c=!0;for(const l of T){const s=l.substring(1,l.length-1);e.match(s)!==null&&(c=!1)}return c}));for(let e of f){const l=(await x.raw(`SHOW FULL COLUMNS FROM ${e}`))[0];i&&(e=m(e));let s=`import { z } from 'zod'

export const ${e} = z.object({`;for(const a of l){const b=i?m(a.Field):a.Field,o=E("table",a,t);o&&(s=`${s}
	${b}: ${o},`)}s=`${s}
})

export const insertable_${e} = z.object({`;for(const a of l){const b=i?m(a.Field):a.Field,o=E("insertable",a,t);o&&(s=`${s}
  ${b}: ${o},`)}s=`${s}
})

export const updateable_${e} = z.object({`;for(const a of l){const b=i?m(a.Field):a.Field,o=E("updateable",a,t);o&&(s=`${s}
  ${b}: ${o},`)}s=`${s}
})

export const selectable_${e} = z.object({`;for(const a of l){const b=i?m(a.Field):a.Field,o=E("selectable",a,t);o&&(s=`${s}
  ${b}: ${o},`)}s=`${s}
})

export type ${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof ${e}>
export type Insertable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof insertable_${e}>
export type Updateable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof updateable_${e}>
export type Selectable${m(`${e}Type`,{pascalCase:!0})} = z.infer<typeof selectable_${e}>
`;const j=t.folder&&t.folder!==""?t.folder:".",_=t.suffix&&t.suffix!==""?`${e}.${t.suffix}.ts`:`${e}.ts`,g=U.join(j,_);F.push(g),t.silent||console.log("Created:",g),q.outputFileSync(g,s)}return await x.destroy(),F}export{G as generate,E as getType};
