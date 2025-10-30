import TaxonomiesFilterList from './taxonomies-filter-list';
import Taxonomy from '../models/taxonomy';
import { getTaxonomyFilterItems } from '../models/taxonomy-transformer';

import './tags-filter.scss';

const { useMemo } = React;

export default function TaxonomiesFilter( props ) {
	const taxonomiesByType = useMemo( () => getTaxonomyFilterItems( props.taxonomies ), [ props.taxonomies ] );

	return (
		<div className="e-kit-library__tags-filter">
			{
				taxonomiesByType.map( ( group ) => (
					<TaxonomiesFilterList
						key={ group.key }
						taxonomiesByType={ group }
						selected={ props.selected }
						onSelect={ props.onSelect }
						category={ props.category }
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
	category: PropTypes.string,
};
