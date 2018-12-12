const spawnSync = require( 'child_process' ).spawnSync;

const status = spawnSync( 'sh', [
	'-c',
	'if type "phpcs" >/dev/null 2>&1; then phpcs -p -s -n . --parallel=32 --standard=./ruleset.xml --extensions=php; fi',
], { stdio: 'inherit' } ).status;

process.exit( status );
