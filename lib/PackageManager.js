const { executeCommand, execa } = require('./utils.js');
const PACKAGE_MANAGER_CONFIG = {
    npm: {
        install: ['install', '--loglevel', 'error']
    }
}
module.exports = class PackageManager {
    constructor(tartgetDir) {
        this.tartgetDir = tartgetDir || process.cwd();
        this.bin = 'npm';
        const npmVersion = execa.sync('npm', ['--version']).stdout;
        if (npmVersion.charAt(0) >= 7) {
            this.needsPeerDepsFix = true;
        }
    }
    async install() {
        const args = []
        // npm 版本大于7
        if (this.needsPeerDepsFix) {
            args.push('--legacy-peer-deps')
        }

        return await this.runCommand('install', args)
    }

    async runCommand(command, args) {
        console.log(process.cwd());
        await executeCommand(
            this.bin,
            [
                ...PACKAGE_MANAGER_CONFIG[this.bin][command],
                ...(args || [])
            ],
            this.tartgetDir
        )
    }
}