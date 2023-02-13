const fs = require('fs')
const acorn = require('acorn')
const MagicString = require('magic-string')

const code = fs.readFileSync('./source.js').toString()

const ast = acorn.parse(code, {
    sourceType: 'module',
    ecmaVersion: 7
})

const walk = require('../../lib/walk')
let indent = 0
const withindent = () => ' '.repeat(indent * 4)
walk(ast, {
    enter(node) {
        if (node.type === 'VariableDeclarator') {
            console.log(withindent(), 'var:', node.id.name)
        }

        if (node.type === 'FunctionDeclaration') {
            console.log(withindent(), 'func:', node.id.name)
            indent++
        }
    },

    leave(node) {
        if (node.type === 'FunctionDeclaration') {
            indent--
        }
    }
})