
const sendCommand = ( command, args ) => {
	if ( ! window.top || ! window.top.$e ) {
		return null;
	}

	return window.top.$e.run( command, args );
};

export default sendCommand;