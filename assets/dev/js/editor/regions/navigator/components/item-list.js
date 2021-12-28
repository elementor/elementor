import PropTypes from 'prop-types';
import ItemListEmpty from './item-list-empty';
import { useItemContext } from '../context/item-context';
import { forwardRef } from 'react';
import ElementItem from 'elementor-regions/navigator/components/items/element-item';

function ItemList( { items, indicateEmpty, ...props }, ref ) {
	const { level = 0 } = useItemContext();

	return (
		<div
			{ ...props}
			ref={ ref }
			className="elementor-navigator__elements">
			{ items?.length ?
				items.map(
					( itemId ) => <ElementItem key={ itemId } itemId={ itemId } level={ level + 1 } />
				) :
				( indicateEmpty && <ItemListEmpty /> )
			}
		</div>
	);
}

export default forwardRef( ItemList );

ItemList.propTypes = {
	listRef: PropTypes.object,
	items: PropTypes.array,
	indicateEmpty: PropTypes.bool,
};
