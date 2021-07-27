import { dim, cyan } from "https://deno.land/std/fmt/colors.ts"
const pendingSuffix = ` ${dim(`[${cyan('pending')}]`)}`

type Context = { [k: string]: any }
type Runnable = (ctx: Context) => void | Promise<void>

type Optional<V> = V | undefined
class Description {
    public name: string
    public parent: Optional<Description>
    public tasks: { [k: string]: Runnable[] } = { before: [], after: [] }
    public tests: Context[] = []
    static current: Optional<Description>

    constructor(
        name: string = '',
        parent?: Optional<Description>
    ) {
        this.name = name
        this.parent = parent
    }

    declareTests() {
        let namePrefix = this.nestedNames().join(' / ')
        this.tests.forEach(options => {
            let { name, fn, pending } = options
            let fullName = `${namePrefix} // ${name}`
            if (!fn) pending = true
            if (pending) fullName += pendingSuffix
            Deno.test({
                ...options,
                ignore: (options.ignore || pending),
                name: fullName,
                fn: async () => {
                    let ctx = {}
                    await this.runTasks('before', ctx)
                    await fn(ctx)
                    await this.runTasks('after', ctx)
                }
            })
        })
    }

    async runTasks(type: string, ctx: Context): Promise<void> {
        await this.parent?.runTasks(type, ctx)
        for (const task of this.tasks[type]) await task(ctx)
    }

    nestedNames(): string[] {
        let names = this.parent?.nestedNames() || []
        names.push(this.name)
        return names
    }
}

export function describe(name: string, fn: () => void) {
    Description.current = new Description(name, Description.current)
    fn()
    Description.current.declareTests()
    Description.current = Description.current.parent
}

function currentDescriptionOrThrow(name: string): Description {
    if (!Description.current) throw Error(
        `#${name} cannot be used outside of a #describe block`
    )
    return (Description.current as Description)
}

export function it(name: string, fn?: Optional<Runnable>, options = {}) {
    const description = currentDescriptionOrThrow('it')
    description.tests.push({ name, fn, ...options })
}

export function before(fn: Runnable) {
    const description = currentDescriptionOrThrow('before')
    description.tasks.before.push(fn)
}

export function after(fn: Runnable) {
    const description = currentDescriptionOrThrow('after')
    description.tasks.after.push(fn)
}
