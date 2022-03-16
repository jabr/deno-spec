import { describe, before, after, it } from "./mod.ts"
import {
    assert, assertEquals, assertStrictEquals,
    assertThrows, assertRejects,
    unreachable, AssertionError
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

    describe('with an async #before block', () => {
        before(async ctx => {
            ctx.immediate = 42
            ctx.awaitedImmediate = await 50
            ctx.awaitedResolvedPromise = await Promise.resolve(60)
            ctx.awaitedQueuedPromise = await new Promise(resolve => {
                queueMicrotask(() => resolve(99))
            })
            ctx.anotherImmediate = Infinity
        })

        it('runs tests after it completes', ctx => {
            assertEquals(ctx.immediate, 42)
            assertEquals(ctx.awaitedImmediate, 50)
            assertEquals(ctx.awaitedResolvedPromise, 60)
            assertEquals(ctx.awaitedQueuedPromise, 99)
            assertEquals(ctx.anotherImmediate, Infinity)
        })
    })

    describe('with an #after block', () => {
        // @todo: other ways to test the after block actually runs?

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

        describe('and an exception', () => {
            const runner = fn => {
                return async () => {
                    await assertRejects(fn, AssertionError, '#after')
                }
            }

            after(() => {
                assert(false, 'error from #after')
            })

            describe('from a #before block', () => {
                before(() => {
                    assert(false, 'error from #before')
                })

                it('the #after block is still run', () => {
                    assert(true)
                }, { runner })
            })

            describe('in an #it block', () => {
                it('the #after block is still run', () => {
                    assert(false, 'error from #it')
                }, { runner })
            })
        })
    })

    describe('using the #xdescribe shortcut', () => {
        it('sets the `ignore` option as the default on contained tests')
    })

    describe('using the #fdescribe shortcut', () => {
        it('sets the `only` option as the default on contained tests')
    })
})

describe('#it', () => {
    describe('with no test function', () => {
        it('creates a "pending" test (ignored with a note on the name)')
    })

    // @todo: better way to test this?
    it('supports the `ignore` option', ctx => {
        unreachable()
    }, { ignore: true })

    describe('using the #xit shortcut', () => {
        it ('sets the `ignore` option')
        it ('merges with other passed options')
        it ('overrides a passsed `ignore` option')
    })

    // @todo: how to test "only" option as part of a suite run?
    describe('with the `only` option', () => {
        // it('only runs those tests', ctx => {
        //     assert(true)
        // }, { only: true })
        //
        // it('does not run normal tests', ctx => {
        //     unreachable()
        // })
    })

    describe('using the #fit shortcut', () => {
        it ('sets the `only` option')
        it ('merges with other passed options')
        it ('overrides a passsed `only` option')
    })
})
