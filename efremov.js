@@ -3,147 +3,147 @@
/*eslint no-sync:0*/

if (process.getuid && process.getuid() === 0) {
	global.console.error("Sinopia doesn't need superuser privileges. Don't run it under root.")
  global.console.error("Sinopia doesn't need superuser privileges. Don't run it under root.")
}

process.title = 'sinopia'

try {
	// for debugging memory leaks
	// totally optional
	require('heapdump')
} catch(err){}
  // for debugging memory leaks
  // totally optional
  require('heapdump')
} catch(err) {}

var logger = require('./logger')
logger.setup() // default setup

var pkg_file = '../package.yaml'
  , fs = require('fs')
  , yaml = require('js-yaml')
  , commander = require('commander')
  , server = require('./index')
  , crypto = require('crypto')
  , Path = require('path')
  , pkg = yaml.safeLoad(fs.readFileSync(__dirname + '/' + pkg_file, 'utf8'))
var commander = require('commander')
var fs        = require('fs')
var YAML      = require('js-yaml')
var Path      = require('path')
var server    = require('./index')
var pkg_file  = '../package.yaml'
var pkg       = YAML.safeLoad(fs.readFileSync(__dirname+'/'+ pkg_file, 'utf8'))

commander
	.option('-l, --listen <[host:]port>', 'host:port number to listen on (default: localhost:4873)')
	.option('-c, --config <config.yaml>', 'use this configuration file (default: ./config.yaml)')
	.version(pkg.version)
	.parse(process.argv)
  .option('-l, --listen <[host:]port>', 'host:port number to listen on (default: localhost:4873)')
  .option('-c, --config <config.yaml>', 'use this configuration file (default: ./config.yaml)')
  .version(pkg.version)
  .parse(process.argv)

if (commander.args.length == 1 && !commander.config) {
	// handling "sinopia [config]" case if "-c" is missing in commandline
	commander.config = commander.args.pop()
  // handling "sinopia [config]" case if "-c" is missing in commandline
  commander.config = commander.args.pop()
}

if (commander.args.length != 0) {
	commander.help()
  commander.help()
}

var config, config_path, have_question
try {
	if (commander.config) {
		config_path = commander.config
		config = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
	} else {
		config_path = './config.yaml'
		try {
			config = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
		} catch(err) {
			var readline = require('readline')
			var rl = readline.createInterface(process.stdin, process.stdout)
			var timeout = setTimeout(function() {
				global.console.log('I got tired waiting for an answer. Exitting...')
				process.exit(1)
			}, 20000)

			;(function askUser() {
				have_question = true
				rl.question('Config file doesn\'t exist, create a new one? (Y/n) ', function(x) {
					clearTimeout(timeout)
					if (x[0] == 'Y' || x[0] == 'y' || x === '') {
						rl.close()

						var created_config = require('../lib/config_gen')()
						config = yaml.safeLoad(created_config.yaml)
						write_config_banner(created_config, config)
						fs.writeFileSync(config_path, created_config.yaml)
						afterConfigLoad()
					} else if (x[0] == 'N' || x[0] == 'n') {
						rl.close()
						global.console.log('So, you just accidentally run me in a wrong folder. Exitting...')
						process.exit(1)
					} else {
						askUser()
					}
				})
			})()
		}
	}
} catch(err) {
	logger.logger.fatal({file: config_path, err: err}, 'cannot open config file @{file}: @{!err.message}')
	process.exit(1)
