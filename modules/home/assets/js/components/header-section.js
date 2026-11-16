import { Paper } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

const HeaderSection = ( props ) => {
	return (
		<Paper
			elevation={ 0 }
			sx={ {
				display: 'flex',
				flexDirection: 'row',
				justifyContent: props.hasInAppTitle ? 'space-between' : 'flex-end',
				alignItems: 'center',
				...( props.hasInAppTitle && { pt: 2.5 } ),
			} }
		>
			{ props.hasInAppTitle && (
				<Typography variant="h5" component="h1">
					{ __( 'Quick Start', 'elementor' ) }
				</Typography>
			) }
			<Button
				variant="contained"
				size="medium"
				color="primary"
				href={ props.editWebsiteUrl }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ __( 'Edit site', 'elementor' ) }
			</Button>
		</Paper>
	);
};

HeaderSection.propTypes = {
	editWebsiteUrl: PropTypes.string.isRequired,
	hasInAppTitle: PropTypes.bool,
};

export default HeaderSection;
