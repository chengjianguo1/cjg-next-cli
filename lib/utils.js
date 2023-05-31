const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');
const Module = require('module');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const log = console.log;
function writeFileTree(dir, files) {
    Object.keys(files).forEach((name) => {
        const filePath = path.join(dir, name)
        fs.ensureDirSync(path.dirname(filePath))
        fs.writeFileSync(filePath, files[name])
    })
}
function executeCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const child = execa(command, args, {
            cwd,
            stdio: ['inherit', 'inherit', 'inherit']
        })

        child.on('close', code => {
            if (code !== 0) {
                reject(new Error(`command failed: ${command} ${args.join(' ')}`))
                return
            }
            resolve()
        })
    })
}
function generateReadme(pkg) {
    return [
        `# ${pkg.name}\n`,
        '## Project setup',
        '```',
        `npm install`,
        '```'
    ].join('\n')
}

const createRequire = Module.createRequire || Module.createRequireFromPath || function (filename) {
    const mod = new Module(filename, null)
    mod.filename = filename
    mod.paths = Module._nodeModulePaths(path.dirname(filename))

    mod._compile(`module.exports = require;`, filename)

    return mod.exports
}
function loadModule(request, context) {
    return createRequire(path.resolve(context, 'package.json'))(request)
}
function sortObject(obj, keyOrder, dontSortByUnicode) {
    if (!obj) return
    const res = {}

    if (keyOrder) {
        keyOrder.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                res[key] = obj[key]
                delete obj[key]
            }
        })
    }

    const keys = Object.keys(obj)

    !dontSortByUnicode && keys.sort()
    keys.forEach(key => {
        res[key] = obj[key]
    })

    return res
}
function stringifyJS(value) {
    const { stringify } = require('javascript-stringify')
    return stringify(value, null, 2)
}


function extractCallDir() {
    // extract api.render() callsite file location using error stack
    const obj = {}
    Error.captureStackTrace(obj)
    const callSite = obj.stack.split('\n')[3]


    // the regexp for the stack when called inside a named function
    const namedStackRegExp = /\s\((.*):\d+:\d+\)$/
    // the regexp for the stack when called inside an anonymous
    const anonymousStackRegExp = /at (.*):\d+:\d+$/


    let matchResult = callSite.match(namedStackRegExp)
    if (!matchResult) {
        matchResult = callSite.match(anonymousStackRegExp)
    }

    const fileName = matchResult[1]
    return path.dirname(fileName)
}

function mergeDeps(sourceDeps, depsToInject) {
    const result = Object.assign({}, sourceDeps)

    for (const depName in depsToInject) {
        const sourceRange = sourceDeps[depName]
        const injectingRange = depsToInject[depName]

        if (sourceRange === injectingRange) continue

        result[depName] = injectingRange
    }
    return result
}

const isObject = val => val && typeof val === 'object';

async function executeNodeScript({ cwd }, data, source) {
    return new Promise((resolve) => {
        const child = spawn(
            process.execPath,//node可执行文件的路径
            ['-e', source, '--', JSON.stringify(data)],
            { cwd, stdio: 'inherit' }
        );
        child.on('close', resolve);
    });
}

module.exports = {
    chalk,
    execa,
    writeFileTree,
    executeCommand,
    log,
    generateReadme,
    loadModule,
    sortObject,
    stringifyJS,
    extractCallDir,
    mergeDeps,
    isObject,
    executeNodeScript
}