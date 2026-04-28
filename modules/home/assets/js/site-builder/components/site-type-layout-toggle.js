import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useTheme } from '@elementor/ui';
import CopyPageIcon from '@elementor/icons/CopyPageIcon';
import WebsiteIcon from '@elementor/icons/WebsiteIcon';
import { LayoutChip, LayoutToggleContainer } from './styled-components';

const SiteTypeLayoutToggle = ( { isOnePage, onIsOnePageChange } ) => {
	const theme = useTheme();
	const multiColor = ! isOnePage ? theme.palette.secondary.contrastText : theme.palette.text.secondary;
	const onePageColor = isOnePage ? theme.palette.secondary.contrastText : theme.palette.text.secondary;

	return (
		<LayoutToggleContainer>
			<LayoutChip
				isSelected={ ! isOnePage }
				icon={ <CopyPageIcon sx={ { color: multiColor } } /> }
				label={ __( 'Multi-page', 'elementor' ) }
				onClick={ () => onIsOnePageChange( false ) }
			/>
			<LayoutChip
				isSelected={ isOnePage }
				icon={ <WebsiteIcon sx={ { color: onePageColor } } /> }
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
