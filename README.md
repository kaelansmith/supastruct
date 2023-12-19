# Supastruct

Supastruct lets you parse/convert [`supabase-js`](https://github.com/supabase/supabase-js) queries into mutable objects, and back again. This enables powerful abstractions to be built on top of `supabase-js` -- a real-world example is [SupaQuery](https://github.com/kaelansmith/supaquery).

# Install

```bash
npm install supastruct
```

# How does it work?

Imagine you have the following Supabase query:

```js
const query = supabase
  .from("todos")
  .select("*")
  .eq("project", 1234)
  .eq("status", "in_progress");
```

Let's imagine you want the ability to toggle on a "debug" mode for all your app's queries while in development -- you simply want to console-log information about each query as they are executed (I'm being purposely trivial). You want the log to output something like this for the above query:

```
> QUERY EXECUTION:
> {
>   query: {
>     from: "todos",
>     filters: {
>       eq: [
>         ["project", 1234],
>         ["status", "in_progress"]
>       ]
>     }
>     modifiers: {
>       select: "*"
>     }
>   },
>   result: {
>     data: [ ... ],
>     error: null,
>   }
> }
```

So, we build a `runQuery` function which will "wrap" all our Supabase-js queries throughout our app; we'll set an ENV variable `DEBUG_QUERIES` to `true` or `false`, which `runQuery` will read to determine whether to log what we'll call "query meta". Let's stub this out:

```js
// in `.env.local`:
DEBUG_QUERIES=true

// in createClient.js:
import { createClient } from '@supabase/supabase-js';
export const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// somewhere in app:
import { db } from "./createClient";
const { data } = runQuery(
  db.from('todos').select('*').eq('project', 1234).eq('status', 'in_progress')
);

// in `runQuery.js`:
export function runQuery(query) {
  const queryMeta = { ... }; // TODO: parse query into object representation
  const result = await query;

  if (process.env.DEBUG_QUERIES) {
    console.log("QUERY EXECUTION:", { query: queryMeta, result })
  }

  return result;
}
```

So, the question is: in `runQuery`, how do we parse the Supabase query into object format? It's a tough problem, but Supastruct makes it dead-simple -- here's how:

```diff js
// in createClient.js:
import { createClient } from '@supabase/supabase-js';
+ import { SupastructClient } from 'supastruct';
- export const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
+ export const db = new SupastructClient(createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY));

// use `db` exactly the same as before to create Supabase-js queries

// in `runQuery.js`:
export function runQuery(query) {
- const queryMeta = { ... }; // TODO: parse query into object representation
+ const queryMeta = query.getQueryMeta(); // getQueryMeta is available on Supastruct clients
  const result = await query;

  if (process.env.DEBUG_QUERIES) {
    console.log("QUERY EXECUTION:", { query: queryMeta, result })
  }

  return result;
}
```

This is a simple example of how Supastruct is useful for writing abstractions around Supabase-js. It gets more interesting when you start to do things like: parse a query into a queryMeta object (i.e. using the `getQueryMeta()` method), programmatically modify the queryMeta (which is simple when it's in object format), and then construct a new Supabase-js query from the modified queryMeta using the `supastruct` function:

```js
import { createClient } from "@supabase/supabase-js";
import { SupastructClient } from "supastruct";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const db = new SupastructClient(supabase);

const query = db()
  .from("todos")
  .select("*")
  .eq("project", 1234)
  .eq("status", "in_progress");

// let's mark all of the above Todos as "done", without respecifying all those same query/filter/modifier methods & args:
const queryMeta = query.getQueryMeta();

const updateMeta = {
  ...queryMeta,
  mutation: "update",
  values: { status: "done" },
};

const { data, error } = await supastruct(supabase, updateMeta);
```

If I wanted to, I could have called `supastruct` above without awaiting it, which wouldn't execute the query and instead would return a Supabase query/filter builder that I could continue chaining methods onto.

Having the ability to programmatically read/modify Supabase-js queries opens up a world of possibilities; for example, check out how [Supaquery](https://github.com/kaelansmith/supaquery) uses it to integrate Supabase with React Query, providing a dead-simple API for "coupled mutations" that enable automatic, zero-config optimistic updates, resulting in a super snappy UI/UX -- all possible thanks to Supastruct.

# Query Hooks

Supastruct also enables you to hook into the Supabase query execution lifecycle with various filter/action hooks, so you can programmatically modify records before they're mutated, and/or define side-effects/actions to run after a query is executed... all at a global level -- i.e. you define these hooks when instantiating your SupastructClient, and then any queries using that client will run those hooks at the appropriate time. Example:

```js
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const db = new SupastructClient(supabase, {
  filters: {
    recordForUpdate: (record) => {
      // transform record here
      return record;
    }
    recordsForInsert: (records) => {
      // transform records here
      return records;
    }
    recordsForUpsert: (records) => {
      // transform records here
      return records;
    }
  },
  actions: {
    onUpdate: (res) => ...,
    onInsert: (res) => ...,
    onUpsert: (res) => ...,
    onDelete: (res) => ...
  }
});
```

# FAQ

<details>
 <summary>How does the Supastruct Client work?</summary>
A Supastruct client wraps a regular Supabase.js client with a Proxy, so it can intercept its method calls and save information about the query being generated before letting the Supabase methods do their thing. It exposes this saved information/metadata via its own client method, `getQueryMetadata`, and also via a property `queryMeta` which gets injected into the Supabase query responses (i.e. alongside `data`, `error`, `count`, etc.).
</details>

#### Have more questions? Drop an issue.

# Feedback

This package is still very young, not well tested, and is likely to have breaking changes in the coming versions. That said, it is successfully being used in production environments, and will only get better with usage & feedback -- please don't hesitate to post GitHub issues, email me at kaelancsmith@gmail.com, or DM me on Twitter [@kaelancsmith](https://twitter.com/kaelancsmith)

---

Made by Kaelan Smith

[kaelansmith.com](https://kaelansmith.com)
