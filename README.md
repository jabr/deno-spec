# deno-spec

Provides a spec-like (`describe`, `it`, etc) testing framework on top of `Deno.test(...)`.

## Example

```js
import { describe, before, it } from "https://deno.land/x/deno-spec/mod.ts"
import { assertEquals } from "http://deno.land/std/testing/asserts.ts"

describe("foo", () => {
    before(ctx => {
        ctx.foo = 'bar'
    })

    it("equals 'bar'", ctx => {
        assertEquals(ctx.foo, 'bar')
    })
})
```

## License

This project is licensed under the terms of the [MIT license](LICENSE.txt).
