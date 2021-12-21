import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useElement( elementId ) {
	/**
	 * The element's Container instance.
	 *
	 * @var {Container}
	 */
	const container = useMemo(
		() => elementor.getContainer( elementId ),
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
	/**
	 * Whether the element usually contain children.
	 *
	 * @var {boolean}
	 */
	const hasChildrenByDefault = useMemo(
		() => {
			return element.elType &&
				( 'widget' !== element.elType || Boolean( element.elements.length ) );
		},
		[ elementId, element.elements ]
	);

	return {
		container,
		element: {
			...element,
			title: container.model.getTitle(),
			icon: container.model.getIcon(),
		},
	};
}

export default useElement;
