import TaxonomiesFilterList from './taxonomies-filter-list';
import Taxonomy, { TAXONOMIES } from '../models/taxonomy';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './tags-filter.scss';

const { useMemo } = React;

export default function TaxonomiesFilter( props ) {
	const taxonomiesByType = useMemo( () => {
			if ( ! props.taxonomies ) {
				return [];
			}

			const taxonomies = [ ...props.taxonomies ];

			return TAXONOMIES.reduce( ( carry, taxonomyItem ) => {
				const formattedTaxonomyItem = {
					...taxonomyItem,
					data: [],
				};

				for ( let i = 0; i < taxonomies.length; i++ ) {
					const currentTaxonomy = Taxonomy.getFormattedTaxonomyItem( taxonomies[ i ] );

					if ( currentTaxonomy.type !== taxonomyItem.key ) {
						continue;
					}

					if ( ! formattedTaxonomyItem.data.find( ( { text } ) => text === currentTaxonomy.text ) ) {
						formattedTaxonomyItem.data.push( currentTaxonomy );
					}

					taxonomies.splice( i, 1 );
					i--;
				}

				if ( formattedTaxonomyItem.data.length ) {
					carry.push( formattedTaxonomyItem );
				}

				return carry;
			}, [] );
		}, [ props.taxonomies ] ),
		eventTracking = ( command, search, section, eventType = 'click' ) => appsEventTrackingDispatch(
			command,
			{
				page_source: 'home page',
				element_location: 'app_sidebar',
				category: props.category && ( '/favorites' === props.category ? 'favorites' : 'all kits' ),
				section,
				search_term: search,
				event_type: eventType,
			},
		);

	return (
		<div className="e-kit-library__tags-filter">
			{
				taxonomiesByType.map( ( group ) => (
					<TaxonomiesFilterList
						key={ group.key }
						taxonomiesByType={ group }
						selected={ props.selected }
						onSelect={ props.onSelect }
						onCollapseChange={ ( collapseState, title ) => {
							const command = collapseState ? 'kit-library/collapse' : 'kit-library/expand';
							eventTracking( command, null, title );
						} }
						onChange={ ( search ) => {
							eventTracking( 'kit-library/filter', search, group.label, 'search' );
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
