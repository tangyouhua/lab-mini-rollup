const walk = require('./walk')
const Scope = require('./scope')

module.exports = function analyse(ast, magicString, module) {
    let scope = new Scope({})

    ast.body.forEach(statement => {
        function addToScope(declaration) {
            const name = declaration.id.name
            scope.add(name)
            if (!scope.parent) {
                statement._defines[name] = true
            }
        }

        Object.defineProperties(statement, {
            _defines: { value: {} },
            _dependsOn: { value: {} },
            _included: { value: false, writable: true },
            _source: { value: magicString.snip(statement.start, statement.end) }
        })

        walk(statement, {
            enter(node) {
                let newScope
                switch (node.type) {
                    case 'FunctionDeclaration':
                        addToScope(node)
                        const params = node.params.map(v => v.name)
                        newScope = new Scope({
                            parent: node,
                            params
                        })
                        break;
                    case 'VariableDeclaration':
                        node.declarations.forEach(addToScope)
                        break;
                    default:
                        break;
                }

                if (newScope) {
                    Object.defineProperties(node, {
                        _scope: { value: newScope }
                    })
                    scope = newScope
                }
            },
            leave(node) {
                if (node._scope) {
                    scope = scope.parent
                }
            }
        })
    })

    ast._scope = scope

    ast.body.forEach(statement => {
        walk(statement, {
            enter(node) {
                if (node.type === 'Identifier') {
                    statement._dependsOn[node.name] = true
                }
            }
        })
    })
}