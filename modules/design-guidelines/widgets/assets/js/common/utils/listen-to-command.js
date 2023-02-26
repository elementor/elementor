import debounce from "./debounce";

const listenToCommand = ( command, handler, shouldDebounce = true ) => {
	if ( ! window.top ) {
		return;
	}

	const preparedHandler = shouldDebounce ? debounce( handler ) : handler;

	window.top.addEventListener( 'elementor/commands/run/after', ( event ) => {
		if ( event.detail.command !== command ) {
			return;
		}
		preparedHandler( event.detail.args);
	} );
};

export default listenToCommand;