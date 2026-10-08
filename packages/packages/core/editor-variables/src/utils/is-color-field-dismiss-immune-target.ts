const COLOR_VARIABLE_FIELD_ID = 'color-variable-field';

const COLOR_FIELD_OVERLAY_SELECTORS = [
	'.MuiPopover-root',
	'.MuiMenu-root',
	'[role="combobox"]',
	'[role="listbox"]',
	'.MuiSelect-select',
].join( ', ' );

const getDocumentsToSearch = ( target: Element ): Document[] => {
	const documents = new Set< Document >();
	documents.add( target.ownerDocument );
	documents.add( document );

	try {
		if ( window.top?.document ) {
			documents.add( window.top.document );
		}
	} catch {
		// Cross-origin restriction.
	}

	document.querySelectorAll( 'iframe' ).forEach( ( frame ) => {
		try {
			if ( frame.contentDocument ) {
				documents.add( frame.contentDocument );
			}
		} catch {
			// Cross-origin iframe.
		}
	} );

	return [ ...documents ];
};

const findActiveColorField = ( target: Element ): HTMLElement | null => {
	for ( const doc of getDocumentsToSearch( target ) ) {
		const field = doc.getElementById( COLOR_VARIABLE_FIELD_ID );

		if ( field ) {
			return field;
		}
	}

	return null;
};

export const isColorFieldDismissImmuneTarget = ( target: EventTarget | null ): boolean => {
	if ( ! ( target instanceof Element ) ) {
		return false;
	}

	const field = findActiveColorField( target );

	if ( ! field ) {
		return false;
	}

	if ( field.contains( target ) ) {
		return true;
	}

	return Boolean( target.closest( COLOR_FIELD_OVERLAY_SELECTORS ) );
};

export const isColorFieldDismissImmuneEvent = ( event: MouseEvent | TouchEvent ): boolean => {
	if ( isColorFieldDismissImmuneTarget( event.target ) ) {
		return true;
	}

	if ( 'composedPath' in event ) {
		for ( const node of event.composedPath() ) {
			if ( isColorFieldDismissImmuneTarget( node ) ) {
				return true;
			}
		}
	}

	return false;
};
