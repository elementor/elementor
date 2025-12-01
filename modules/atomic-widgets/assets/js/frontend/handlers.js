import { register } from '@elementor/frontend-handlers';

const ATOMIC_ELEMENT_TYPES_WITH_LINKS_WITHIN = [
	'e-heading',
	'e-paragraph',
];

const ATOMIC_ELEMENT_TYPES_WITH_LINKS_OUTSIDE = [];

const ATOMIC_ELEMENT_TYPES_WITH_LINKS_AS_THEM = [
    'e-svg',
	'e-div-block',
	'e-flexbox',
	'e-image',
	'e-button',
];

registerLinkActionsHandler();

function registerLinkActionsHandler() {
	[
        ...ATOMIC_ELEMENT_TYPES_WITH_LINKS_WITHIN,
        ...ATOMIC_ELEMENT_TYPES_WITH_LINKS_OUTSIDE,
        ...ATOMIC_ELEMENT_TYPES_WITH_LINKS_AS_THEM,
    ].forEach( ( elementType ) => register( {
		elementType,
		id: `${ elementType }-link-action-handler`,
		callback: ( { element } ) => {
			const actionLinks = getActionLinkElements( element, elementType );

			if ( ! actionLinks?.length ) {
				return;
			}

			const cleanupFunctions = actionLinks.map( handleLinkActions );

			return () => cleanupFunctions.forEach( ( cleanup ) => cleanup?.() );
		},
	} ) );
}

function getActionLinkElements( element, type ) {
    switch ( true ) {
        case ATOMIC_ELEMENT_TYPES_WITH_LINKS_WITHIN.includes( type ):
            return Array.from( element?.children || [] )
                .filter( ( child ) => child.dataset && child.dataset.href );
        case ATOMIC_ELEMENT_TYPES_WITH_LINKS_OUTSIDE.includes( type ):
            return [ element?.parentNode ].filter( ( parent ) => parent.dataset && parent.dataset.href )
                .filter( ( child ) => child.dataset && child.dataset.href );
        case ATOMIC_ELEMENT_TYPES_WITH_LINKS_AS_THEM.includes( type ):
            return [ element ].filter( ( self ) => self.dataset && self.dataset.href );
    }

    return [];
}

function handleLinkActions( element ) {
	const url = element.dataset.href;
	const isEditorContext = !! window.elementor;

	if ( ! url ) {
		return;
	}

	const handler = ( event ) => {
		if ( isEditorContext ) {
			return;
		}

		event.preventDefault();

		if ( ! window.elementorFrontend?.utils?.urlActions ) {
			return;
		}

		elementorFrontend.utils.urlActions.runAction( url, event );
	};

	element.addEventListener( 'click', handler );

	return () => element.removeEventListener( 'click', handler );
}
