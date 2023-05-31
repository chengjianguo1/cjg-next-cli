const PackageManager = require('./PackageManager');
const { log, chalk, writeFileTree, executeNodeScript, generateReadme } = require('./utils');
module.exports = class createReactApp {
    constructor(creatorContext) {
        this.name = creatorContext.name;
        this.targetDir = creatorContext.targetDir;
        this.scriptName = 'react-scripts';
        this.templateName = 'cra-template';
        this.allDependencies = ['react', 'react-dom', this.scriptName, this.templateName];
        this.pkg = {};
        this.preset = {};
        this.pm = null;
        this.start();
    }
    async start() {
        await this.initPackageManagerEnv();
        await this.generate();
    }
    async initPackageManagerEnv() {
        const { name, targetDir, allDependencies, scriptName, templateName } = this;
        log(`create project:${chalk.yellow(name)}`);
        this.pm = new PackageManager(this.targetDir);
        const pkg = {
            name: name,
            version: '0.1.0',
            private: true,
            devDependencies: {},
        }
        allDependencies.forEach(dep => {
            pkg.devDependencies[dep] = 'latest';
        })
        this.pkg = pkg;
        await writeFileTree(targetDir, {
            'package.json': JSON.stringify(pkg, null, 2)
        })
        console.log(
            `Installing ${chalk.cyan('react')}, ${chalk.cyan(
                'react-dom'
            )}, and ${chalk.cyan(scriptName)}${` with ${chalk.cyan(templateName)}`}...`
        );
        await this.pm.install()
    }
    async generate() {
        const { name, targetDir, templateName } = this;
        const verbose = true;
        //项目根目录  项目的名字 verbose是否显示详细信息 原始的目录 模板名称cra-template
        let data = [targetDir, name, verbose, targetDir, templateName];
        let source = `
    var init = require('react-scripts/scripts/init.js');
    init.apply(null, JSON.parse(process.argv[1]));
    `;
        await executeNodeScript({ cwd: targetDir }, data, source);
        process.exit(0);
    }
}