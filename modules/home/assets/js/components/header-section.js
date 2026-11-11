import { Paper } from '@elementor/ui';
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
				justifyContent: 'flex-end',
				alignItems: 'center',
			} }
		>
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
};

export default HeaderSection;
