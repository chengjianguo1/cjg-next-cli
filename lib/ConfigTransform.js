const { stringifyJS } = require('./utils.js');
class ConfigTransform {
    constructor(options) {
        this.fileDescriptor = options;
    }
    transform(value) {
        let file = this.getDefaultFile();
        const {
            type,
            filename
        } = file;
        if (type !== 'js') {
            throw new Error('哎呀，出错了，仅支持 js 后缀的配置文件');
        }
        const content = this.getContent(value, filename);
        return {
            filename,
            content
        };
    }
    getContent(value, filename) {
        if (filename === 'vue.config.js') {
            return `const { defineConfig } = require('@vue/cli-service')\n` + `module.exports = defineConfig(${stringifyJS(value, null, 2)})`;
        } else {
            return `module.exports = ${stringifyJS(value, null, 2)}`;
        }
    }
    getDefaultFile() {
        const [type] = Object.keys(this.fileDescriptor);
        const [filename] = this.fileDescriptor[type];
        return {
            type,
            filename
        };
    }
}
module.exports = ConfigTransform;