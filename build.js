"use strict";

// ShellJS.
const shelljs = require('shelljs');

// Colors.
const chalk = require('chalk');


shelljs.echo('Start building...');


/* Cleans aot & dist folders */
shelljs.rm('-Rf', 'aot/*');
shelljs.rm('-Rf', 'dist/*');


/* TSLint with Codelyzer */
// https://github.com/palantir/tslint/blob/master/src/configs/recommended.ts
// https://github.com/mgechev/codelyzer
shelljs.echo('Start eslint');

shelljs.exec('npx eslint "./src/**/*.ts" --ignore-pattern "./src/**/*.ngfactory.ts"');

shelljs.echo(chalk.green('eslint completed'));


/* Aot compilation */
shelljs.echo('Start AoT compilation');
shelljs.echo('ngc -p tsconfig-build.json');

shelljs.exec('npx ngc -p tsconfig-build.json');

shelljs.echo(chalk.green('AoT compilation completed'));


/* Creates umd bundle */
shelljs.echo('Start bundling');
shelljs.echo('rollup -c rollup.config.js');

shelljs.exec('npx rollup -c rollup.config.js');

shelljs.echo(chalk.green('Bundling completed'));


/* Minimizes umd bundle */
shelljs.echo('Start minification');

shelljs.exec('npx uglifyjs ./dist/bundles/ng4-signalr.umd.js -o ./dist/bundles/ng4-signalr.umd.min.js');

shelljs.echo(chalk.green('Minification completed'));


/* Copies files */
shelljs.cp('-Rf', ['package.json', 'LICENSE'], 'dist');


shelljs.echo('End building');
