import { ElementItem } from './items';
import { forwardRef } from 'react';
import { useItemContext } from '../context/item-context';
import ItemListEmpty from './item-list-empty';
import PropTypes from 'prop-types';

function ItemList( { items, indicateEmpty, ...props }, ref ) {
	const { level } = useItemContext();

	return (
		<div { ...props} ref={ ref } className="elementor-navigator__elements">
			{ items?.length ?
				items.map(
					( itemId ) => <ElementItem key={ itemId } itemId={ itemId } level={ level + 1 } />
				) :
				( indicateEmpty && <ItemListEmpty /> )
			}
		</div>
	);
}

ItemList = forwardRef( ItemList );

ItemList.propTypes = {
	listRef: PropTypes.object,
	items: PropTypes.array,
	indicateEmpty: PropTypes.bool,
};

export { ItemList };
export default ItemList;
