import TaxonomiesFilterList from './taxonomies-filter-list';
import Taxonomy, { taxonomyType } from '../models/taxonomy';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

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
