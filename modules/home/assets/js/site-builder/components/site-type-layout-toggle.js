import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import CopyPageIcon from '@elementor/icons/CopyPageIcon';
import WebsiteIcon from '@elementor/icons/WebsiteIcon';
import { LayoutChip, LayoutToggleContainer } from './styled-components';

const SiteTypeLayoutToggle = ( { isOnePage, onIsOnePageChange } ) => {
	return (
		<LayoutToggleContainer>
			<LayoutChip
				isSelected={ ! isOnePage }
				icon={ <CopyPageIcon /> }
				label={ __( 'Multi-page', 'elementor' ) }
				onClick={ () => onIsOnePageChange( false ) }
			/>
			<LayoutChip
				isSelected={ isOnePage }
				icon={ <WebsiteIcon /> }
				label={ __( 'One-page', 'elementor' ) }
				onClick={ () => onIsOnePageChange( true ) }
			/>
		</LayoutToggleContainer>
	);
};

SiteTypeLayoutToggle.propTypes = {
	isOnePage: PropTypes.bool.isRequired,
	onIsOnePageChange: PropTypes.func.isRequired,
};

export default SiteTypeLayoutToggle;
