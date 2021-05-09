import { describe, before, after, it } from "./mod.ts"
import {
    assert, assertEquals, assertStrictEquals, assertThrows, unreachable
} from "https://deno.land/std/testing/asserts.ts"

[ it, before, after ].forEach(fn => {
    const desc = `outside of a #describe block // #${fn.name} throws an error`
    const errMsg = `#${fn.name} cannot be used outside of a #describe block`
    Deno.test(desc, () => assertThrows(fn, Error, errMsg))
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
    // @todo: better way to test this?
    it('supports the `ignore` option', ctx => {
        unreachable()
    }, { ignore: true })

    // @todo: how to test as part of a normal run?
    // describe('with the `only` option', () => {
    //     it('only runs those tests', ctx => {
    //         assert(true)
    //     }, { only: true })
    //
    //     it('does not run normal tests', ctx => {
    //         unreachable()
    //     })
    // })
})
