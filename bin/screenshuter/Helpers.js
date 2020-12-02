'use strict';

class Helpers {
	constructor() {
		this.args = require( './config' );
		this.execSync = require( 'child_process' ).execSync;
		this.fs = require( 'fs' );
	}

	printMsg = ( msg ) => {
		// If debug equal to true - display msg
		if ( this.args.debug ) {
			const now = new Date();
			console.log( `\n${ now } - ${ msg }` );
		}
	};

	// execShellCommand( cmd ) {
	// 	const exec = require( 'child_process' ).exec;
	// 	return new Promise( ( resolve, reject ) => {
	// 		exec( cmd, ( error, stdout, stderr ) => {
	// 			if ( error ) {
	// 				console.warn( error );
	// 			}
	// 			resolve( stdout ? stdout : stderr );
	// 		} );
	// 	} );
	// }

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
	execShellCommand = ( cmd ) => {
		try {
			const resExec = this.execSync( cmd ).toString();
			this.printMsg( `success ${ resExec }` );
			return resExec;
		} catch ( error ) {
			// this.printMsg( `status: ${ error.status }` ); // Might be 127 in your example.
			this.printMsg( `message: ${ error.message }` ); // Holds the message you typically want.
			// this.printMsg( `stderr: ${ error.stderr }` ); // Holds the stderr output. Use `.toString()`.
			this.printMsg( `stdout: ${ error.stdout }` ); // Holds the stdout output. Use `.toString()`.
		}
		// let result;
		// this.execSync( cmd, ( error, stdout, stderr ) => {
		// 	if ( error ) {
		// 		this.printMsg( `error: ${ error.message }` );
		// 		return;
		// 	}
		// 	if ( stderr ) {
		// 		this.printMsg( `stderr: ${ stderr }` );
		// 		return;
		// 	}
		// 	this.printMsg( `success ${ stdout }'` );
		// 	result = stdout;
		// } );
		// console.log( x );

		// return result;
	};

	download = ( cmd ) => {
		this.execShellCommand( `${ cmd }` );
	};

	createFolder = ( path, recursive = true ) => {
		// ! this.fs.existsSync( `${ this.args.wp_core_dir }` ) && this.fs.mkdirSync( `${ this.args.wp_core_dir }`, { recursive: true } );
		if ( ! this.fs.existsSync( `${ path }` ) ) {
			this.fs.mkdirSync( `${ path }`, { recursive: recursive } );
		}
	};

	/**
	 * Delete exists directory and all its contents, including any subdirectories and files
	 */
	deleteFolder = ( path ) => {
		if ( this.fs.existsSync( `${ path }` ) ) {
			this.deleteFolderRecursive( `${ path }` );
			if ( ! this.fs.existsSync( `${ path }` ) ) {
				this.printMsg( `Deleted directory: ${ path }.` );
			} else {
				this.printMsg( `Can't deleted directory: ${ path }.` );
			}
		}
	};

	/**
	 * Delete directory and all its contents, including any subdirectories and files
	 * @path (string) - The path to folder
	 */
	deleteFolderRecursive = ( path ) => {
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
	};

	/**
	 * Create a symbolic link
	 * @target (string) - The target path to folder/file
	 * @path (string) - The path to folder/file
	 */
	createSymlink = ( target, path ) => {
		try {
			this.fs.symlinkSync( target, path, 'dir' );
			this.printMsg( 'Symbolic link creation complete.' );
		} catch ( error ) {
			this.printMsg( error );
		}
	};

	/**
	 * Deleting symbolic link
	 * @path (string) - The path to folder/file
	 */
	unlink = ( path ) => {
		this.fs.unlink( path, ( ( err ) => {
			if ( err ) {
				this.printMsg( err );
			} else {
				this.printMsg( `Deleted Symbolic Link: ${ path }.` );
			}
		} ) );
	};

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
		return !! this.execShellCommand( `npm ls ${ packageName }` );
	}
}

module.exports = new Helpers;
