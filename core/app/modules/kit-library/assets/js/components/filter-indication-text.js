import { sprintf } from '@wordpress/i18n';
import { Text, Button, Grid } from '@elementor/app-ui';

const { useMemo } = React;

import './filter-indication-text.scss';

export default function FilterIndicationText( props ) {
	const isFilterActive = useMemo( () => props.filter.search, [ props.filter ] );

	if ( ! isFilterActive ) {
		return '';
	}

	return (
		<Grid container className="e-kit-library__filter-indication">
			<Text className="e-kit-library__filter-indication-text">
				{ sprintf( __( 'Showing %s Results', 'elementor' ), props.resultCount ) }
				{ ' ' }
				{ props.filter.search && sprintf( __( 'For: "%s"', 'elementor' ), props.filter.search ) }
			</Text>
			<Button className="e-kit-library__filter-indication-button" text={ __( 'Clear All' ) } variant="underlined" onClick={ props.onClear }/>
		</Grid>
	);
}

FilterIndicationText.propTypes = {
	filter: PropTypes.shape( {
		search: PropTypes.string,
	} ),
	resultCount: PropTypes.number.isRequired,
	onClear: PropTypes.func.isRequired,
};
