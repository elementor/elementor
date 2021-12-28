import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useElement( elementId ) {
	/**
	 * The element's Container instance.
	 *
	 * @var {Container|false}
	 */
	const container = useMemo(
		() => elementor.getContainer( elementId || 'document' ),
		[ elementId ]
	);

	/**
	 * The the element selector from store.
	 *
	 * @var {{}}
	 */
	const element = useSelector(
		( state ) => state[ 'document/elements' ][ elementId ]
	);

	return {
		container,
		element: {
			settings: {},
			element: [],
			title: container.model.getTitle(),
			icon: container.model.getIcon(),
			...element,
		},
	};
}

export default useElement;
