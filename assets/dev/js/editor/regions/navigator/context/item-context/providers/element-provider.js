import { useMemo } from 'react';
import { ItemProvider } from '../item-context';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

export function ElementProvider( { itemId: elementId, level, ...props } ) {
	/**
	 * The element's Container instance.
	 *
	 * @type {Container|false}
	 */
	const container = useMemo(
		() => elementor.getContainer( elementId ),
		[ elementId ]
	);

	/**
	 * The element selector from store.
	 *
	 * @type {{}}
	 */
	const element = useSelector(
		( state ) => state[ 'document/elements' ][ elementId ]
	);

	/**
	 * Whether the is the document's tree root.
	 *
	 * @type {boolean}
	 */
	const root = useMemo(
		() => 'document' === elementId,
		[ elementId ]
	);

	/**
	 * The item representation of the element.
	 *
	 * @type {{}}
	 */
	const item = useMemo(
		() => ( {
			settings: {},
			elements: [],
			title: container.getTitle(),
			icon: container.getIcon(),
			root,
			hasChildrenByDefault: container.hasChildrenByDefault,
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
