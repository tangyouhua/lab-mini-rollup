const fs = require('fs')
const acorn = require('acorn')
const MagicString = require('magic-string')

const code = fs.readFileSync('./source.js').toString()

const ast = acorn.parse(code, {
    sourceType: 'module',
    ecmaVersion: 7
})

// console.log('ast', ast)

const declarations = {}
ast.body
    .filter(v => v.type === 'VariableDeclaration')
    .map(
        v => {
            console.log('声明', v.declarations[0].id.name)
            declarations[v.declarations[0].id.name] = v
        }
    )

const statements = []
ast.body
    .filter(v => v.type !== 'VariableDeclaration')
    .map(node => {
        statements.push(declarations[node.expression.callee.name])
        statements.push(node)
    }
    )

const m = new MagicString(code)
console.log('-------------')
statements.map(node => {
    console.log(m.snip(node.start, node.end).toString())
})
console.log('-------------')
