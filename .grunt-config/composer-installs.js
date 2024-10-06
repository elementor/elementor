const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand( command, description ) {
	return new Promise( ( resolve, reject ) => {
		console.log( `Running: ${ description }` );

		exec( command, ( err, stdout, stderr ) => {
			if ( err ) {
				console.error( `Error running command: ${ command }\n${ stderr }` );

				return reject( err );
			}
			console.log( stdout );

			resolve();
		});
	});
}

const checkVendorFoldersExist = () => {
	const rootDir = process.cwd();

	const vendorExists = fs.existsSync(path.join(rootDir, 'vendor'));
	const vendorPrefixedExists = fs.existsSync(path.join(rootDir, 'vendor_prefixed'));

	return vendorExists && vendorPrefixedExists;
}

const runComposerTasks = async () => {
	try {
		if ( checkVendorFoldersExist() ) {
			console.log( 'Both "vendor" and "vendor_prefixed" folders exist. Skipping composer install commands.' );

			return;
		}

		// Step 1: composer install with scripts and dev dependencies
		await runCommand( 'composer install --optimize-autoloader --prefer-dist', 'composer install with scripts and dev dependencies' );

		// Step 2: composer install without dev dependencies
		await runCommand( 'composer install --no-scripts --no-dev', 'composer install without dev dependencies' );

		// Step 3: composer dump-autoload
		await runCommand( 'composer dump-autoload', 'composer dump-autoload' );

		console.log( 'Composer tasks completed successfully.' );
	} catch (error) {
		console.error( 'An error occurred during the composer tasks.' );
	}
}

module.exports = runComposerTasks;
