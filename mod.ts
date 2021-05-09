type Context = { [k: string]: any }
type Runnable = (ctx: Context) => void | Promise<void>
type OptionalDescription = Description | undefined

class Description {
    public name: string
    public parent: OptionalDescription
    public tasks: { [k: string]: Runnable[] } = { before: [], after: [] }
    public tests: Context[] = []
    static current: OptionalDescription = undefined

    constructor(
        name: string = '',
        parent: OptionalDescription = undefined
    ) {
        this.name = name
        this.parent = parent
    }

    declareTests() {
        let namePrefix = this.nestedNames().join(' / ')
        this.tests.forEach(options => {
            let { name, fn } = options
            Deno.test({
                ...options,
                name: `${namePrefix} // ${name}`,
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
        this.tasks[type].forEach(async task => await task(ctx))
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

export function it(name: string, fn: Runnable, options = {}) {
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
