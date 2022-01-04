import { ITEMS_COMPONENT, resolveItemComponent } from './items';
import { createElement, forwardRef } from 'react';
import { ItemListEmpty } from './';
import { useItemContext } from '../context/item-context';
import PropTypes from 'prop-types';

function ItemList( { items, type, indicateEmpty, ...props }, ref ) {
	const { level = 0 } = useItemContext();

	return (
		<div { ...props } ref={ ref } className="elementor-navigator__elements">
			{ items.length ?
				items.map(
					( itemId ) => createElement(
						resolveItemComponent( type ),
						{ key: itemId, itemId, level: level + 1 }
					)
				) : ( indicateEmpty && <ItemListEmpty /> )
			}
		</div>
	);
}

ItemList = forwardRef( ItemList );

ItemList.propTypes = {
	items: PropTypes.array,
	type: PropTypes.oneOf(
		Object.keys( ITEMS_COMPONENT )
	).isRequired,
	indicateEmpty: PropTypes.bool,
};

ItemList.defaultProps = {
	items: [],
	type: 'element',
};

export { ItemList };
export default ItemList;
