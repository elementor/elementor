import { taxonomyType } from '../models/taxonomy';
import useTaxonomies from '../hooks/use-taxonomies';
import TaxonomiesFilterList from './taxonomies-filter-list';

import './tags-filter.scss';

const { useMemo } = React;

export default function TaxonomiesFilter( props ) {
	const { data } = useTaxonomies();
	const groupedTags = useMemo( () => {
		if ( ! data ) {
			return [];
		}

		return taxonomyType.map( ( tagType ) => ( {
			...tagType,
			data: data.filter( ( item ) => item.type === tagType.key ),
		} ) );
	}, [ data ] );

	return (
		<div className="e-kit-library__tags-filter">
			{
				groupedTags.map( ( group ) => (
					group.data.length > 0 &&
					<TaxonomiesFilterList
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

TaxonomiesFilter.propTypes = {
	selected: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.string ) ),
	onSelect: PropTypes.func,
};
