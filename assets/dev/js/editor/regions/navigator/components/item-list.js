import Item from './item';
import PropTypes from 'prop-types';
import ItemListEmpty from './item-list-empty';

export default function ItemList( { elements, level, indicateEmpty } ) {
	return (
		<div className="elementor-navigator__elements">
			{ elements.length ?
				elements.map(
					( element ) => (
						<Item key={ element.id } elementId={ element.id } level={ level } />
					)
				) :
				( indicateEmpty && <ItemListEmpty /> )
			}
		</div>
	);
}

ItemList.propTypes = {
	level: PropTypes.number,
	elements: PropTypes.array,
	indicateEmpty: PropTypes.bool,
};
