const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
    productionSourceMap: true,
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.(md|txt)$/i,
                    use: 'raw-loader',
                }
            ]
        }
    }
});

