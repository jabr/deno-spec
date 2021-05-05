type Context = { [k: string]: any }
type Voids = void | Promise<void>
type Runnable = (ctx: Context) => Voids;

class Description {
    public name: string = ''
    public parent: Description | undefined = undefined
    public tasks: { [k: string]: Runnable[] } = {
        before: [], after: []
    }
    public tests: Context[] = []
    static current: Description = new Description('$')

    constructor(
        name: string = '',
        parent: Description | undefined = undefined
    ) {
        this.name = name
        this.parent = parent
    }

    declareTests() {
        let namePrefix = this.nestedNames().join(' / ')
        // console.log(this, namePrefix)
        this.tests.forEach(options => {
            let { name, fn } = options
            Deno.test({
                ...options,
                name: `${namePrefix} - ${name}`,
                fn: async () => {
                    let ctx = {}
                    await this.runTasks('before', ctx)
                    await fn(ctx)
                    await this.runTasks('after', ctx)
                }
            })
        })
    }

    async runTasks(type: string, ctx: Context) : Promise<void> {
        await this.parent?.runTasks(type, ctx)
        this.tasks[type].forEach(async task => await task(ctx))
    }

    nestedNames() : string[] {
        let names = this.parent?.nestedNames() || []
        names.push(this.name)
        return names
    }
}

export function describe(name: string, fn: () => void) {
    // console.log(Description.current)
    Description.current = new Description(name, Description.current)
    // console.log(Description.current)
    fn()
    Description.current.declareTests()
    Description.current = Description.current.parent || Description.current
}

export function it(name: string, fn: Runnable, options = {}) {
    Description.current.tests.push({ name, fn, ...options })
}

export function before(fn: Runnable) {
    Description.current.tasks.before.push(fn)
}

export function after(fn: Runnable) {
    Description.current.tasks.after.push(fn)
}
