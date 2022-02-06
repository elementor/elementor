import { useCallback } from 'react';
import { useSelector } from 'react-redux';

export function useElementSelection( elementId ) {
	/**
	 * The element selection state from store.
	 *
	 * @type {boolean|{boolean}}
	 */
	const elementSelection = useSelector(
		( state ) => {
			// When no `elementId` is given, all elements are going to be subscribed.
			const selector = state[ 'document/elements/selection' ];

			if ( undefined !== elementId ) {
				return -1 !== selector.indexOf( elementId );
			}

			return selector;
		}
	);

	/**
	 * Set the element selection state in the store.
	 *
	 * @void
	 */
	const setElementSelection = useCallback(
		( { append, section, scrollIntoView = true } = {} ) => {
			if ( undefined !== elementId ) {
				// Toggle the provided elements state.
				$e.run( 'document/elements/toggle-selection', {
					container: elementor.getContainer( elementId ),
					options: {
						scrollIntoView,
						section,
						append,
					},
				} );
			} else {
				// Toggle all elements state.
				$e.run( 'document/elements/select-all' );
			}
		},
		[ elementId ]
	);

	return [
		elementSelection,
		setElementSelection,
	];
}

export default useElementSelection;
