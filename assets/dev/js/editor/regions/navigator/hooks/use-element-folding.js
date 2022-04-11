import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

export function useElementFolding( elementId ) {
	/**
	 * The element folding state from store.
	 *
	 * @type {boolean|{boolean}}
	 */
	const elementFolding = useSelector(
		( state ) => {
			// When no `elementIds` is given, all elements are going to be subscribed.
			const selector = state[ 'navigator/folding' ];

			if ( undefined !== elementId ) {
				return selector[ elementId ];
			}

			return selector;
		}
	);

	/**
	 * Set the element folding state in the store.
	 *
	 * @void
	 */
	const setElementFolding = useCallback(
		( state ) => {
			if ( undefined !== elementId ) {
				// Toggle the provided elements state.
				$e.run( 'navigator/elements/toggle-folding', {
					container: elementor.getContainer( elementId ),
					state,
				} );
			} else {
				// Toggle all elements state.
				$e.run( 'navigator/elements/toggle-folding-all', { state } );
			}
		},
		[ elementId ]
	);

	useEffect( () => {
		// Initialize a newly introduced element folding state.
		if ( undefined === elementFolding ) {
			setElementFolding( false );
		}
	}, [ elementId ] );

	return [
		elementFolding,
		setElementFolding,
	];
}

export default useElementFolding;
