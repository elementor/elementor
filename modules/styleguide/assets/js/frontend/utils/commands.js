export const runCommand = ( command, args ) => {
	if ( ! window.top || ! window.top.$e ) {
		return null;
	}

	return window.top.$e.run( command, args );
};

export const commandListener = ( command, callback ) => {
	if ( ! window?.top?.$e ) {
		return null;
	}

	window.top.addEventListener( 'elementor/commands/run/after', ( e ) => {
		if ( command === e.detail.command ) {
			callback( e );
		}
	} );
};

export const removeCommandListener = ( command, callback ) => {
	if ( ! window?.top?.$e ) {
		return null;
	}

	window.top.removeEventListener( 'elementor/commands/run/after', ( e ) => {
		if ( command === e.detail.command ) {
			callback( e.detail );
		}
	} );
};
