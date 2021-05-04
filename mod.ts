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
    ) {}

    declareTests() {
        let namePrefix = this.nestedNames().join(' / ')
        this.tests.forEach(options => {
            let { name, fn } = options
            Deno.test({
                ...options,
                name: `${namePrefix} - ${name}`,
                fn: () => {
                    let ctx = {}
                    this.runTasks('before', ctx)
                    fn(ctx)
                    this.runTasks('after', ctx)
                }
            })
        })
    }

    runTasks(type: string, ctx: Context) : void {
        this.parent?.runTasks(type, ctx)
        this.tasks[type].forEach(task => task(ctx))
    }

    nestedNames() : string[] {
        let names = this.parent?.nestedNames() || []
        names.push(this.name)
        return names
    }
}

export function describe(name: string, fn: () => void) {
    Description.current = new Description(name, Description.current)
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
