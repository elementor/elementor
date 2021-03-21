import { tagTypes } from '../models/tag';
import useTags from '../hooks/use-tags';
import TagsFilterList from './tags-filter-list';

import './tags-filter.scss';

const { useMemo } = React;

export default function TagsFilter( props ) {
	const { data } = useTags();
	const groupedTags = useMemo( () => {
		if ( ! data ) {
			return [];
		}

		return tagTypes.map( ( tagType ) => ( {
			...tagType,
			data: data.filter( ( item ) => item.type === tagType.key ),
		} ) );
	}, [ data ] );

	return (
		<div className="e-kit-library__tags-filter">
			{
				groupedTags.map( ( group ) => (
					group.data.length > 0 &&
					<TagsFilterList
						key={ group.key }
						groupedTags={ group }
						selected={ props.selected }
						onSelect={ props.onSelect }
					/>
				) )
			}
		</div>
	);
}

TagsFilter.propTypes = {
	selected: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.string ) ),
	onSelect: PropTypes.func,
};
