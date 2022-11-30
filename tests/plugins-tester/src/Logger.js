export const Logger = class {
	debug = false;

	constructor( options ) {
		Object.entries( options ).forEach( ( [ key, value ] ) => {
			this[ key ] = value;
		} );
	}

	error( ...args ) {
		console.error( ...args );
	}

	info( ...args ) {
		console.info( ...args );
	}

	log( ...args ) {
		console.log( ...args );
	}
};
