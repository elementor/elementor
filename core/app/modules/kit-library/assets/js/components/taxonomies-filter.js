import TaxonomiesFilterList from './taxonomies-filter-list';
import Taxonomy, { taxonomyType } from '../models/taxonomy';

import './tags-filter.scss';

const { useMemo } = React;

export default function TaxonomiesFilter( props ) {
	const taxonomiesByType = useMemo( () => {
		if ( ! props.taxonomies ) {
			return [];
		}

		return taxonomyType
			.map( ( tagType ) => ( {
				...tagType,
				data: props.taxonomies.filter( ( item ) => item.type === tagType.key ),
			} ) )
			.filter( ( { data } ) => data.length > 0 );
	}, [ props.taxonomies ] );

	return (
		<div className="e-kit-library__tags-filter">
			{
				taxonomiesByType.map( ( group ) => (
					<TaxonomiesFilterList
						key={ group.key }
						taxonomiesByType={ group }
						selected={ props.selected }
						onSelect={ props.onSelect }
						onOpen={ ( value, title ) => {
							// TODO: Don't shoot this event on first load
							if ( typeof ( value ) !== 'undefined' ) {
								$e.run(
									`kit-library/${ ( value ) ? 'expand' : 'collapse' }`,
									{
										section: title,
										category: ( '/' === props.category ? 'all kits' : 'favorites' ),
										action: ( value ) ? 'expand' : 'collapse',
									},
									{
										meta: {
											event: 'sidebar section interaction',
											source: 'home page',
										},
									},
								);
							}
						} }
						onSearchEvent={ ( search, category ) => {
							$e.run(
								'kit-library/checkbox-filtration',
								{
									search_term: search,
									category,
									section: group.label,
								},
								{
									meta: {
										source: 'home page',
										event: 'sidebar section filters search',
										event_type: 'search',
									}
								},
							);
						} }
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
