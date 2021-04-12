import Taxonomy, { taxonomyType } from '../models/taxonomy';
import TaxonomiesFilterList from './taxonomies-filter-list';

import './tags-filter.scss';

const { useMemo } = React;

export default function TaxonomiesFilter( props ) {
	const groupedTags = useMemo( () => {
		if ( ! props.taxonomies ) {
			return [];
		}

		return taxonomyType.map( ( tagType ) => ( {
			...tagType,
			data: props.taxonomies.filter( ( item ) => item.type === tagType.key ),
		} ) );
	}, [ props.taxonomies ] );

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
	taxonomies: PropTypes.arrayOf( PropTypes.instanceOf( Taxonomy ) ),
};
