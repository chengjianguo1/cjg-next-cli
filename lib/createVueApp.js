const PackageManager = require('./PackageManager');
const Generator = require('./Generator');
const { chalk, writeFileTree, log, generateReadme, sortObject, loadModule } = require('./utils');
module.exports = class createReactApp {
    constructor(creatorContext) {
        this.name = creatorContext.name;
        this.targetDir = creatorContext.targetDir;
        this.pkg = {};
        this.preset = {};
        this.pm = null;
        this.start();
    }
    async start() {
        await this.initPackageManagerEnv();
        await this.generate();
        await this.generateReadme();
        this.finished();
    }
    async initPackageManagerEnv() {
        const { name, targetDir } = this;
        log(`create project:${chalk.yellow(name)}`);
        this.pm = new PackageManager(this.targetDir)
        const preset = {
            useConfigFiles: false,
            cssPreprocessor: undefined,
            plugins: {
                '@vue/cli-plugin-babel': {},
                '@vue/cli-plugin-eslint': {
                    config: 'base',
                    lintOn: ['save']
                }
            }
        }
        preset.plugins['@vue/cli-service'] = Object.assign({
            projectName: name
        }, preset);
        this.preset = preset;
        const pkg = {
            name: name,
            version: '0.1.0',
            private: true,
            devDependencies: {},
        }
        const deps = Object.keys(preset.plugins)
        deps.forEach(dep => {
            let { version } = preset.plugins[dep]
            if (!version) {
                version = 'latest'
            }
            pkg.devDependencies[dep] = version
        })

        this.pkg = pkg;
        await writeFileTree(targetDir, {
            'package.json': JSON.stringify(pkg, null, 2)
        })
        log(`⚙ install CLI plugins. waiting...`)

        await this.pm.install()
    }
    async generate() {
        const { pkg, preset, targetDir } = this;
        const plugins = await this.resolvePlugins(preset.plugins, pkg)
        const generator = new Generator(targetDir, {
            pkg,
            plugins
        })

        //写入磁盘
        await generator.generate({
            extractConfigFiles: preset.useConfigFiles // false
        })
        // log(`文件已写入磁盘！`);
        await this.pm.install()
    }
    resolvePlugins(rawPlugins) {
        // 插件排序，@vue/cli-service 排第1个
        rawPlugins = sortObject(rawPlugins, ['@vue/cli-service'], true)
        const plugins = []

        for (const id of Object.keys(rawPlugins)) {
            const apply = loadModule(`${id}/generator`, this.targetDir) || (() => { })
            let options = rawPlugins[id] || {}
            plugins.push({ id, apply, options })
        }

        return plugins
    }
    async generateReadme() {
        log()
        log('📄 generator README.md...')
        const { targetDir, pkg } = this;
        await writeFileTree(targetDir, {
            'README.md': generateReadme(pkg)
        })
    }
    finished() {
        const { name } = this;
        log(`🎉 Project created successfully ${chalk.yellow(name)}.`)
        log(`👉 Start the project with the following command :\n\n` + chalk.cyan(`cd ${name}\n`) + chalk.cyan(`npm run dev`))
    }
}