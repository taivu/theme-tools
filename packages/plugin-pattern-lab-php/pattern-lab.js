'use strict';

const gulp = require('gulp');
const core = require('@theme-tools/core');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const defaultConfig = require('./config.default');

module.exports = (userConfig) => {
  const config = core.utils.merge({}, defaultConfig, userConfig);

  const plConfig = yaml.safeLoad(
    fs.readFileSync(config.configFile, 'utf8')
  );
  const plRoot = path.join(config.configFile, '../..');
  const plSource = path.join(plRoot, plConfig.sourceDir);
  // const plPublic = path.join(plRoot, plConfig.publicDir);
  const consolePath = path.join(plRoot, 'core/console');

  function plBuild(done, errorShouldExit) {
    core.utils.sh(`php ${consolePath} --generate`, errorShouldExit, (err) => {
      core.events.emit('reload');
      done(err);
    });
  }

  function compile(done) {
    plBuild(done, true);
  }
  compile.description = 'Compile Pattern Lab';

  function watch() {
    const watchedExtensions = config.watchedExtensions.join(',');
    const plGlob = [path.normalize(`${plSource}/**/*.{${watchedExtensions}}`)];
    const src = config.extraWatches
      ? [].concat(plGlob, config.extraWatches)
      : plGlob;
    gulp.watch(src, done => plBuild(done, false));
  }
  watch.description = 'Watch and rebuild Pattern Lab';

  return {
    compile,
    watch,
  };
};
