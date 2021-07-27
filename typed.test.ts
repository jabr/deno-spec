import { describe, it, Context, Runnable } from "./mod.ts"
import {
    assert, assertExists
} from "https://deno.land/std/testing/asserts.ts"

describe('typed', () => {
    describe('#it', () => {
        describe('sync', () => {
            it('works using a Context', ctx => {
                assertExists(ctx)
            })

            it('works without using a Context', () => {
                assert(true)
            })
        })

        describe('async', () => {
            it('works using a Context', async ctx => {
                assertExists(ctx)
            })

            it('works without using a Context', async () => {
                assert(true)
            })
        })

        describe('with no test function', () => {
            it('creates a "pending" test (ignored with a note on the name)')
        })
    })

    describe('Context and Runnable types', () => {
        it('are exported', () => {
            const fn = (ctx: Context) => {}
            assertExists(fn as Runnable)
        })
    })
})
