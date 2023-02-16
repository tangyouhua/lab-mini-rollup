const { parse } = require('acorn')
const MagicString = require('magic-string')
const analyse = require('./analyse')

class Module {
    constructor({ code }) {
        this.code = new MagicString(code)
        this.ast = parse(code, {
            ecmaVersion: 7,
            sourceType: 'module'
        })
        this.analyse()
    }

    analyse() {
        this.imports = {}
        this.exports = {}
        this.ast.body.forEach(node => {
            if (node.type === 'ImportDeclaration') {
                const source = node.source.value;
                const { specifiers } = node
                specifiers.forEach(specifier => {
                    const localName = specifier.local ? specifier.local.name : ''
                    const name = specifier.imported ? specifier.imported.name : ''
                    this.imports[localName] = { name, localName, source }
                })
            } else if (/^Export/.test(node.type)) {
                const declaration = node.declaration
                if (declaration.type === 'VariableDeclaration') {
                    if (!declaration.declarations)
                        return
                    const localName = declaration.declarations[0].id.name
                    this.exports[localName] = {
                        node,
                        localName,
                        expression: declaration
                    }
                }
            }

            analyse(this.ast, this.code, this)

            this.definitions = {}
            this.ast.body.forEach(statement => {
                Object.keys(statement._defines).forEach(name => {
                    this.definitions[name] = statement
                })
            })
        });
    }
}

module.exports = Module