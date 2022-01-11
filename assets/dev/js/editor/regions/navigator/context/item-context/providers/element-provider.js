import { useMemo } from 'react';
import { ItemProvider } from '../item-context';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

export function ElementProvider( { itemId: elementId, level, ...props } ) {
	/**
	 * The element's Container instance.
	 *
	 * @var {Container|false}
	 */
	const container = useMemo(
		() => elementor.getContainer( elementId ),
		[ elementId ]
	);

	/**
	 * The element selector from store.
	 *
	 * @var {{}}
	 */
	const element = useSelector(
		( state ) => state[ 'document/elements' ][ elementId ]
	);

	/**
	 * Whether the is the document's tree root.
	 *
	 * @var {boolean}
	 */
	const root = useMemo(
		() => 'document' === elementId,
		[ elementId ]
	);

	/**
	 * Whether the element usually contain children (regardless to nested elements).
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

	/**
	 * The item representation of the element.
	 *
	 * @var {{}}
	 */
	const item = useMemo(
		() => ( {
			settings: {},
			elements: [],
			title: container.model.getTitle?.(),
			icon: container.model.getIcon?.(),
			root,
			hasChildrenByDefault,
			...element,
		} ),
		[ container, element ]
	);

	return <ItemProvider { ...props } value={ { container, item, level } } />;
}

ElementProvider.propTypes = {
	itemId: PropTypes.string,
	level: PropTypes.number,
};

export default ElementProvider;
