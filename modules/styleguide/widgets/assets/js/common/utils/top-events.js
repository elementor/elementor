export const addEventListener = ( event, handler ) => {
	if ( ! window.top ) {
		return;
	}

	window.top.addEventListener( event, handler );
};

export const removeEventListener = ( event, handler ) => {
	if ( ! window.top ) {
		return;
	}

	window.top.removeEventListener( event, handler );
};

export const addHook = ( event, handler ) => {
	if ( ! window.top ) {
		return;
	}

	window.top.elementor.hooks.addAction( event, handler );
};

export const removeHook = ( event, handler ) => {
	if ( ! window.top ) {
		return;
	}

	window.top.elementor.hooks.removeAction( event, handler );
};




export const AFTER_COMMAND_EVENT = 'elementor/commands/run/after';
