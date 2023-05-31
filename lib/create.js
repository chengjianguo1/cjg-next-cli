const path = require('path');
const inquirer = require('inquirer');
const createVueApp = require('./createVueApp');
const createReactApp = require('./createReactApp');
class Creator {
    constructor(projectName, targetDir) {
        this.context = {
            name: projectName,
            targetDir: targetDir
        }
    }
    async start() {
        try {
            const preset = await this.choosePrompts();
            await this.initPackageManager(preset);
        } catch (error) {
            console.log(chalk.red(error));
            process.exit(1);
        }
    }
    async choosePrompts() {
        let type = ''
        let prompt = {
            name: 'preset',
            type: 'list',
            message: `Please pick a preset:`,
            choices: [
                { name: 'vue2', value: 'vue2' },
                { react: 'react', value: 'react' }
            ]
        }
        const answers = await inquirer.prompt(prompt);
        if (answers.preset == 'vue2') {
            type = 'vue2';
        } else {
            type = 'react'
        }
        return type;
    }
    initPackageManager(preset) {
        if (preset == 'vue2') {
            new createVueApp(this.context);
        } else if (preset == 'react') {
            new createReactApp(this.context);
        }
    }
}
module.exports = function create(name, options) {
    const projectName = name;
    const dir = process.cwd();
    const targetDir = path.resolve(dir, projectName);
    const creator = new Creator(projectName, targetDir);
    creator.start();
}