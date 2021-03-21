import { Collapse, Checkbox } from '@elementor/app-ui';
import Tag from '../models/tag';

const { useState } = React;

export default function TagsFilterList( props ) {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<Collapse
			className="e-kit-library__tags-filter-list"
			title={ props.groupedTags.label }
			isOpen={ isOpen }
			onChange={ setIsOpen }
		>
			{
				props.groupedTags.data.map( ( tag ) => (
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
		</Collapse>
	);
}

TagsFilterList.propTypes = {
	groupedTags: PropTypes.shape( {
		key: PropTypes.string,
		label: PropTypes.string,
		data: PropTypes.arrayOf( PropTypes.instanceOf( Tag ) ),
	} ),
	selected: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.string ) ),
	onSelect: PropTypes.func,
};
