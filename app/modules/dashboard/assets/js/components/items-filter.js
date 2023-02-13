import ItemsFilterList from './items-filter-list';
import { itemType } from '../models/item';

import './tags-filter.scss';

const { useMemo } = React;

export default function ItemsFilter( props ) {
	const itemsByType = useMemo( () => {
		if ( ! props.items ) {
			return [];
		}

		return itemType
			.map( ( tagType ) => ( {
				...tagType,
				data: props.items.filter( ( item ) => item.type === tagType.key ),
			} ) )
			.filter( ( { data } ) => data.length > 0 );
	}, [ props.items ] );

	return (
		<div className="e-kit-library__tags-filter">
			{
				itemsByType.map( ( group ) => (
					<ItemsFilterList
						key={ group.key }
						itemsByType={ group }
					/>
				) )
			}
		</div>
	);
}

ItemsFilter.propTypes = {
	items: PropTypes.arrayOf( PropTypes.object ),
};
