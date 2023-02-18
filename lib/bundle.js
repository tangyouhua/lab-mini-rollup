const path = require('path')
const fs = require('fs')
const Module = require('./module')
const MagicString = require('magic-string')

class Bundle {
    constructor({ entry }) {
        this.entryPath = entry.replace(/\.js$/, '') // a.js -> a
        this.modules = []
    }

    /*
     * main.js -> import foo
     * importer is main.js, importee is foo
     */
    fetchModule(importee, importer) {
        let route
        if (!importer) {
            route = importee // main module
        } else {
            // calculate path of importer
            if (path.isAbsolute(importee)) {
                route = importee
            } else {
                route = path.resolve(
                    path.dirname(importer),
                    importee.replace(/\.js$/, '') + '.js'
                )
            }
        }

        if (route) {
            const code = fs.readFileSync(route, 'utf-8').toString()
            const module = new Module({
                code,
                path: route,
                bundle: this
            })
            return module
        }
    }

    build(outputFileName) {
        const entryModule = this.fetchModule(this.entryPath)
        this.statements = entryModule.expandAllStatements()
        const { code } = this.generate()
        fs.writeFileSync(outputFileName, code, 'utf-8')
    }

    generate() {
        const magicString = new MagicString.Bundle()
        this.statements.forEach(statement => {
            const source = statement._source.clone()
            /*
             * At this time, tree shaking is almost done
             * safe to remove export statements
             * export const a = 1 => const a = 1
             */
            if (statement.type === 'ExportNamedDeclaration') {
                source.remove(statement.start, statement.declaration.start)
            }
            magicString.addSource({
                content: source,
                separator: '\n'
            })
        })
        return { code: magicString.toString() }
    }
}

module.exports = Bundle