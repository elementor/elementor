'use strict';

/**
 * Class Helpers represent the helpers functionality of the app
 */
class Helpers {
	constructor() {
		this.args = require( './config' );
		this.installPackagesForImagesCompare();
		this.chalk = '';
		this.execSync = require( 'child_process' ).execSync;
		// this.exec = require( 'child_process' ).exec;
		// const util = require( 'util' );
		// this.exec = util.promisify( require( 'child_process' ).exec );
		//this.sh = shell;
		this.fs = require( 'fs' );
	}

	installPackagesForImagesCompare() {
		// process.chdir( this.args.wp_core_dir );
		if ( ! this.isInstalledPackage( 'shelljs' ) ) {
			this.execShellCommand( 'npm i -g shelljs' );
		}
		if ( ! this.isInstalledPackage( 'chalk' ) ) {
			this.execShellCommand( 'npm i -g chalk' );
			this.chalk = require( 'chalk' );
		}
		if ( ! this.isInstalledPackage( 'minimist' ) ) {
			this.execShellCommand( 'npm i minimist' );
		}
		if ( ! this.isInstalledPackage( 'backstopjs' ) ) {
			this.execShellCommand( 'npm i -g backstopjs' );
		}
	}

	printMsg( type, msg ) {
		// If debug equal to true - display msg
		if ( this.args.debug ) {
			const now = new Date();
			let msgColor;

			switch ( type.toLowerCase() ) {
				case 'error':
					msgColor = this.chalk.red;
					break;
				case 'info':
				case 'warning':
					msgColor = this.chalk.yellow;
					break;
				case 'success':
					msgColor = this.chalk.green;
					break;
				default:
					msgColor = this.chalk.white;
			}

			console.log( msgColor( `\n${ now } - ${ msg }` ) );
		}
	}

	/**
	 *  Exec shell command
	 *  If an error is NOT thrown, then:
	 *
	 *	Status is guaranteed to be 0
	 *	Stdout is what's returned by the function
	 *	Stderr is almost definitely empty because it was successful.
	 *	In the rare event the command line executable returns a stderr and yet exits with status 0 (success), and you want to read it, you will need the async function.
	 *  https://stackoverflow.com/questions/32874316/node-js-accessing-the-exit-code-and-stderr-of-a-system-command
	 *
	 * @param cmd
	 * @returns {string}
	 */
	execShellCommand( cmd ) {
		// this.exec( cmd, ( error, stdout, stderr ) => {
		// 	if ( error ) {
		// 		this.printMsg( `error: ${ error.message }` );
		// 		return;
		// 	}
		// 	if ( stderr ) {
		// 		this.printMsg( `stderr: ${ stderr }` );
		// 		return;
		// 	}
		// 	this.printMsg( `success ${ stdout }'` );
		// 	return stdout;
		// } );
		try {
			const resExec = this.execSync( cmd ).toString();
			this.printMsg( 'success', `success ${ resExec }` );
			return resExec;
		} catch ( error ) {
			// this.printMsg( `status: ${ error.status }` ); // Might be 127 in your example.
			// this.printMsg( 'error', `message: ${ error.message }` ); // Holds the message you typically want.
			// this.printMsg( `stderr: ${ error.stderr }` ); // Holds the stderr output. Use `.toString()`.
			this.printMsg( 'error', `stdout: ${ error.stdout }` ); // Holds the stdout output. Use `.toString()`.
		}
		// const { error, stdout, stderr } = await exec( cmd );
		// if ( error.status ) {
		// 	// this.printMsg( `status: ${ error.status }` ); // Might be 127 in your example.
		// 	this.printMsg( `message: ${ error.message }` ); // Holds the message you typically want.
		// 	// this.printMsg( `stderr: ${ error.stderr }` ); // Holds the stderr output. Use `.toString()`.
		// 	this.printMsg( `stdout: ${ error.stdout }` ); // Holds the stdout output. Use `.toString()`.
		// }
		// this.printMsg( `success ${ stdout }` );
		// return stdout;
	}

	/**
	 * Download
	 */
	download( cmd ) {
		this.execShellCommand( `${ cmd }` );
	}

	/**
	 * Create directory
	 */
	createFolder( path, recursive = true ) {
		if ( ! this.fs.existsSync( `${ path }` ) ) {
			this.fs.mkdirSync( `${ path }`, { recursive: recursive } );
		}
	}

	/**
	 * Delete exists directory and all its contents, including any subdirectories and files
	 */
	deleteFolder( path ) {
		if ( this.fs.existsSync( `${ path }` ) ) {
			this.deleteFolderRecursive( `${ path }` );
			if ( ! this.fs.existsSync( `${ path }` ) ) {
				this.printMsg( 'success', `Deleted directory: ${ path }.` );
			} else {
				this.printMsg( 'error', `Can't deleted directory: ${ path }.` );
			}
		}
	}

	/**
	 * Delete directory and all its contents, including any subdirectories and files
	 * @path (string) - The path to folder
	 */
	deleteFolderRecursive( path ) {
		if ( this.fs.existsSync( path ) ) {
			this.fs.readdirSync( path ).forEach( ( file, index ) => {
				const curPath = path + '/' + file;
				if ( this.fs.lstatSync( curPath ).isDirectory() ) { // recurse
					this.deleteFolderRecursive( curPath );
				} else { // delete file
					this.fs.unlinkSync( curPath );
				}
			} );
			this.fs.rmdirSync( path );
		}
	}

	/**
	 * Create a symbolic link
	 * @target (string) - The target path to folder/file
	 * @path (string) - The path to folder/file
	 */
	createSymlink( target, path ) {
		if ( ! this.isSymlink( path ) ) {
			try {
				this.fs.symlinkSync( target, path, 'dir' );
				this.printMsg( 'success', 'Symbolic link creation complete.' );
			} catch ( error ) {
				this.printMsg( error );
			}
		}
	}

	/**
	 * Deleting symbolic link
	 * @path (string) - The path to folder/file
	 */
	unlink( path ) {
		this.fs.unlink( path, ( ( err ) => {
			if ( err ) {
				this.printMsg( err );
			} else {
				this.printMsg( 'success', `Deleted Symbolic Link: ${ path }.` );
			}
		} ) );
	}

	/**
	 * Check if folder/file is a symbolic link
	 * @path (string) - The path to folder/file
	 */
	isSymlink( path ) {
		try {
			return this.fs.lstatSync( path ).isSymbolicLink();
		} catch ( err ) {
		}
		return null;
	}

	isInstalledPackage( packageName ) {
		return !! this.execShellCommand( `npm ls -g ${ packageName }` );
	}
}

module.exports = new Helpers;
