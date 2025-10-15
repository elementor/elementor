import Taxonomy from '../models/taxonomy';
import Collapse from './collapse';
import SearchInput from './search-input';
import { Checkbox, Text } from '@elementor/app-ui';
import { sprintf } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { useTracking } from '../context/tracking-context';

const MIN_TAGS_LENGTH_FOR_SEARCH_INPUT = 15;

const TaxonomiesFilterList = ( props ) => {
	const [ isOpen, setIsOpen ] = useState( props.taxonomiesByType.isOpenByDefault );
	const [ search, setSearch ] = useState( '' );
	const tracking = useTracking();

	const taxonomies = useMemo( () => {
		if ( ! search ) {
			return props.taxonomiesByType.data;
		}

		const lowerCaseSearch = search.toLowerCase();

		return props.taxonomiesByType.data.filter(
			( tag ) => tag.text.toLowerCase().includes( lowerCaseSearch ),
		);
	}, [ props.taxonomiesByType.data, search ] );

	return (
		<Collapse
			className="e-kit-library__tags-filter-list"
			title={ props.taxonomiesByType.label }
			isOpen={ isOpen }
			onChange={ setIsOpen }
		>
			{
				props.taxonomiesByType.data.length >= MIN_TAGS_LENGTH_FOR_SEARCH_INPUT &&
					<SearchInput
						size="sm"
						className="e-kit-library__tags-filter-list-search"
						// Translators: %s is the taxonomy type.
						placeholder={ sprintf( __( 'Search %s...', 'elementor' ), props.taxonomiesByType.label ) }
						value={ search }
						onChange={ ( searchTerm ) => {
							setSearch( searchTerm );
						} }
					/>
			}
			<div className="e-kit-library__tags-filter-list-container">
				{ 0 === taxonomies.length && <Text>{ __( 'No Results Found', 'elementor' ) }</Text> }
				{
					taxonomies.map( ( taxonomy ) => (
						// eslint-disable-next-line jsx-a11y/label-has-associated-control
						<label key={ taxonomy.text } className="e-kit-library__tags-filter-list-item">
							<Checkbox
								checked={ !! props.selected[ taxonomy.type ]?.includes( taxonomy.id || taxonomy.text ) }
								onChange={ ( e ) => {
									const checked = e.target.checked;
									const callback = () => {
										props.onSelect( taxonomy.type, ( prev ) => {
											return checked
												? [ ...prev, taxonomy.id || taxonomy.text ]
												: prev.filter( ( tagId ) => ! [ taxonomy.id, taxonomy.text ].includes( tagId ) );
										} );
									};

									if ( 'categories' === taxonomy.type && checked ) {
										tracking.trackKitlibCategorySelected( taxonomy.text, callback );
									} else if ( 'tags' === taxonomy.type && checked ) {
										tracking.trackKitlibTagSelected( taxonomy.text, callback );
									} else if ( 'subscription_plans' === taxonomy.type && checked ) {
										tracking.trackKitlibPlanFilterSelected( taxonomy.text, callback );
									} else {
										callback();
									}
								} } />
							{ taxonomy.text }
						</label>
					) )
				}
			</div>
		</Collapse>
	);
};

TaxonomiesFilterList.propTypes = {
	taxonomiesByType: PropTypes.shape( {
		key: PropTypes.string,
		label: PropTypes.string,
		data: PropTypes.arrayOf( PropTypes.instanceOf( Taxonomy ) ),
		isOpenByDefault: PropTypes.bool,
	} ),
	selected: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.string ) ),
	onSelect: PropTypes.func,
	onCollapseChange: PropTypes.func,
	category: PropTypes.string,
	onChange: PropTypes.func,
};

export default React.memo( TaxonomiesFilterList );
