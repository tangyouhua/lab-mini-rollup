const Bundle = require('../bundle')
const fs = require('fs')

jest.mock('fs')

describe('测试Bundle', () => {
    it('fetchModule', () => {
        const bundle = new Bundle({ entry: './a.js' })
        fs.readFileSync.mockReturnValueOnce(`const a = 1`)
        const module = bundle.fetchModule('index.js')
        const { calls } = fs.readFileSync.mock
        expect(calls[0][0]).toBe('index.js')
        expect(module.code.toString()).toBe(`const a = 1`)
    });

    describe('build', () => {
        it('单条语句', () => {
            const bundle = new Bundle({ entry: 'index.js' })
            fs.readFileSync.mockReturnValueOnce(`console.log(1)`)
            const module = bundle.build('bundle.js')
            const { calls } = fs.writeFileSync.mock
            expect(calls[0][0]).toBe('bundle.js')
            expect(calls[0][1]).toBe(`console.log(1)`)
        });

        it('多条语句', () => {
            const bundle = new Bundle({ entry: 'index.js' })
            fs.readFileSync.mockReturnValueOnce(`
                const a = () => 1;
                const b = () => 2;
                a()
            `)
            fs.writeFileSync.mock.calls = []
            const module = bundle.build('bundle.js')
            const { calls } = fs.writeFileSync.mock
            expect(calls[0][0]).toBe('bundle.js')
            expect(calls[0][1]).toBe(`const a = () => 1;\na()`)
        });

        it('多模块', () => {
            const bundle = new Bundle({ entry: 'index.js' })
            fs.readFileSync
                .mockReturnValueOnce(`import { a } from './a';\na()`) // load main
                .mockReturnValueOnce(`export const a = () => 1;`) // load module a
            fs.writeFileSync.mock.calls = []
            bundle.build('bundle.js')
            const { calls } = fs.writeFileSync.mock
            expect(calls[0][0]).toBe('bundle.js')
            expect(calls[0][1]).toBe(`const a = () => 1;\na()`)
        });
    });
});