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
	 * The item representation of the element.
	 *
	 * @var {{}}
	 */
	const item = useMemo(
		() => ( {
			settings: {},
			elements: [],
			title: container.model.getTitle(),
			icon: container.model.getIcon(),
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
