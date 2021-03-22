import { sprintf } from '@wordpress/i18n';
import { Collapse, Checkbox, SearchInput } from '@elementor/app-ui';
import Tag from '../models/tag';

const { useState, useEffect, useMemo } = React;

const MIN_TAGS_LENGTH_FOR_SEARCH_INPUT = 15;

export default function TagsFilterList( props ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ search, setSearch ] = useState( '' );

	const tags = useMemo( () => {
		if ( ! search ) {
			return props.groupedTags.data;
		}

		const lowerCaseSearch = search.toLowerCase();

		return props.groupedTags.data.filter(
			( tag ) => tag.text.toLowerCase().includes( lowerCaseSearch )
		);
	}, [ props.groupedTags.data, search ] );

	useEffect( () => setIsOpen( props.groupedTags.isOpenByDefault ), [] );

	return (
		<Collapse
			className="e-kit-library__tags-filter-list"
			title={ props.groupedTags.label }
			isOpen={ isOpen }
			onChange={ setIsOpen }
		>
			{
				props.groupedTags.data.length >= MIN_TAGS_LENGTH_FOR_SEARCH_INPUT &&
					<SearchInput
						size="sm"
						className="e-kit-library__tags-filter-list-search"
						placeholder={ sprintf( __( 'Search in %s', 'elementor' ), props.groupedTags.label ) }
						value={ search }
						onChange={ setSearch }
					/>
			}
			<div className="e-kit-library__tags-filter-list-container">
				{
					tags.map( ( tag ) => (
						<label key={ tag.text } className="e-kit-library__tags-filter-list-item">
							<Checkbox
								checked={ props.selected[ tag.type ]?.includes( tag.text ) || false }
								onChange={ ( e ) => {
									const checked = e.target.checked;

									props.onSelect( tag.type, ( prev ) => {
										return checked ?
											[ ...prev, tag.text ] :
											prev.filter( ( tagId ) => tagId !== tag.text );
									} );
								} }/>
							{ tag.text }
						</label>
					) )
				}
			</div>
		</Collapse>
	);
}

TagsFilterList.propTypes = {
	groupedTags: PropTypes.shape( {
		key: PropTypes.string,
		label: PropTypes.string,
		data: PropTypes.arrayOf( PropTypes.instanceOf( Tag ) ),
		isOpenByDefault: PropTypes.bool,
	} ),
	selected: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.string ) ),
	onSelect: PropTypes.func,
};
