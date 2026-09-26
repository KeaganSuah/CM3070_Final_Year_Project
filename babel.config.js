// Configures Babel so Expo can compile the React Native project.
// Returns the Babel settings required by the Expo project.
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
