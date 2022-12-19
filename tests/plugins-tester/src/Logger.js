export const Logger = class {
	error( ...args ) {
		// eslint-disable-next-line no-console
		console.error( ...args );
	}

	info( ...args ) {
		// eslint-disable-next-line no-console
		console.info( ...args );
	}

	log( ...args ) {
		// eslint-disable-next-line no-console
		console.log( ...args );
	}
};
