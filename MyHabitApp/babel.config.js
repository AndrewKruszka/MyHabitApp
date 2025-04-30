module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          'module-resolver',
          {
            alias: {
              '@components': './src/components',
              '@screens': './src/screens',
              '@utils': './src/utils',
              '@hooks': './src/hooks',
              '@navigation': './src/navigation',
              '@constants': './src/constants',
              '@services': './src/services',
              '@assets': './src/assets',
            },
          },
        ],
      ],
    };
  };