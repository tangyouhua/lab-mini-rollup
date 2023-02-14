class Scope {
    constructor(options) {
        this.parent = options.parent
        this.names = options.names
    }

    add(name) {
        if (this.names) {
            this.names.push(name)
        } else {
            this.names = [name]
        }
    }

    contains(name) {
        return !!this.findDefiningScope(name)
    }

    findDefiningScope(name) {
        if (this.names.includes(name)) {
            return this
        } else if (this.parent) {
            return this.parent.findDefiningScope(name)
        }
        return null
    }
}
module.exports = Scope