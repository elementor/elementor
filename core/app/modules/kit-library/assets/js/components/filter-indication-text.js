import { sprintf } from '@wordpress/i18n';
import { Text, Button, Grid, Badge } from '@elementor/app-ui';

const { useMemo } = React;

import './filter-indication-text.scss';

export default function FilterIndicationText( props ) {
	const selectedTags = useMemo( () =>
			Object.values( props.filter.tags ).reduce( ( current, groupedTags ) => [ ...current, ...groupedTags ] ),
		[ props.filter.tags ]
	);

	const isFilterActive = useMemo(
		() =>
			props.filter.search ||
			selectedTags.length,
		[ props.filter ]
	);

	if ( ! isFilterActive ) {
		return '';
	}

	return (
		<Grid container className="e-kit-library__filter-indication">
			<Text className="e-kit-library__filter-indication-text">
				{ sprintf( __( 'Showing %s Results', 'elementor' ), props.resultCount ) }
				{ ' ' }
				{ props.filter.search && sprintf( __( 'For: "%s"', 'elementor' ), props.filter.search ) }
				{ ' ' }
				{ selectedTags.length > 0 && (
					<>
						{ __( 'In', 'elementor' ) }
						{ ' ' }
						{ selectedTags.map( ( tag ) => (
							<Badge key={ tag } className="e-kit-library__filter-indication-badge">
								{ tag }
								<Button
									text={ __( 'Remove', 'elementor' ) }
									hideText={ true }
									icon="eicon-editor-close"
									className="e-kit-library__filter-indication-badge-remove"
									onClick={ () => props.onRemoveTag( tag ) }
								/>
							</Badge>
						) ) }
					</>
				) }

			</Text>
			<Button
				className="e-kit-library__filter-indication-button"
				text={ __( 'Clear All' ) }
				variant="underlined"
				onClick={ props.onClear }
			/>
		</Grid>
	);
}

FilterIndicationText.propTypes = {
	filter: PropTypes.shape( {
		search: PropTypes.string,
		tags: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.string ) ),
	} ),
	resultCount: PropTypes.number.isRequired,
	onClear: PropTypes.func.isRequired,
	onRemoveTag: PropTypes.func.isRequired,
};
