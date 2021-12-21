import { useSelector } from 'react-redux';

export function useElementSelection( elementId ) {
	/**
	 * The the elements selection selector from store.
	 *
	 * @var {{}}
	 */
	return useSelector(
		( state ) => {
			let selector = state[ 'document/elements/selection' ];

			if ( elementId ) {
				selector = selector[ elementId ];
			}

			return selector;
		}
	);
}

export default useElementSelection;
