import { useSelector } from 'react-redux';

export function useElementFolding( elementId ) {
	/**
	 * The the elements folding selector from store.
	 *
	 * @var {{}}
	 */
	return useSelector(
		( state ) => {
			let selector = state[ 'document/elements/folding' ];

			if ( elementId ) {
				selector = selector[ elementId ];
			}

			return selector;
		}
	);
}

export default useElementFolding;
