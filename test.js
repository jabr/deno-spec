import { describe, before, after, it } from "./mod.ts"
import { assert, assertEquals, assertStrictEquals, unreachable }
    from "https://deno.land/std/testing/asserts.ts"
// import { deferred } from "https://deno.land/std/async/mod.ts"

it('it works', ctx => {
    assert(true)
})

describe('#describe', () => {
    it('has an empty context', ctx => {
        assertEquals(ctx, {})
    })

    describe('with a #before block', () => {
        before(ctx => {
            ctx.item = 42
        })

        it('runs the block', ctx => {
            assertStrictEquals(ctx.item, 42)
        })

        describe('and a second, nested #before block', () => {
            before(ctx => {
                ctx.item = -Infinity
                ctx.other = 'forty-two'
            })

            it('runs all the blocks, in root up order', ctx => {
                assertStrictEquals(ctx.item, -Infinity)
                assertStrictEquals(ctx.other, 'forty-two')
            })
        })
    })

    describe('with an #after block', () => {
        describe('reseting a lexically scoped counter', () => {
            let counter = 0

            after(ctx => {
                counter = 0
            })

            it('counter is zero', ctx => {
                assertStrictEquals(counter++, 0)
            })

            it('counter is zero despite previous increment', ctx => {
                assertStrictEquals(counter++, 0)
            })
        })

        // @todo: other ways to test the after block actually runs?
    })
})

describe('#it', () => {
    it('supports the `ignore` option', ctx => {
        unreachable()
    }, { ignore: true })

    // @todo
    // it('supports the `only` option', ctx => {
    // }, { only: true })
})
