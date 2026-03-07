module.exports = function (api) {
    api.cache(true)
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-proposal-nullish-coalescing-operator',
            '@babel/plugin-proposal-logical-assignment-operators',
            '@babel/plugin-transform-template-literals',
            '@babel/plugin-transform-arrow-functions',
            '@babel/plugin-transform-shorthand-properties',
            '@babel/plugin-transform-spread',
            'react-native-reanimated/plugin',
        ],
    }
}
