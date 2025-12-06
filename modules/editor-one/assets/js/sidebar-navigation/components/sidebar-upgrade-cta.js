import { Box, Button } from '@elementor/ui';
import CrownIcon from '@elementor/icons/CrownIcon';
import PropTypes from 'prop-types';

const SidebarUpgradeCta = ( { upgradeUrl, upgradeText, hasPro } ) => {
	const isPro = true === hasPro || '1' === hasPro || 'true' === hasPro;

	if ( isPro ) {
		return null;
	}

	const handleUpgradeClick = () => {
		window.open( upgradeUrl, '_blank' );
	};

	return (
		<Box sx={ { p: 2 } }>
			<Button
				variant="outlined"
				color="promotion"
				fullWidth
				startIcon={ <CrownIcon /> }
				onClick={ handleUpgradeClick }
				sx={ {
					justifyContent: 'center',
				} }
			>
				{ upgradeText }
			</Button>
		</Box>
	);
};

SidebarUpgradeCta.propTypes = {
	upgradeUrl: PropTypes.string.isRequired,
	upgradeText: PropTypes.string.isRequired,
	hasPro: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ).isRequired,
};

export default SidebarUpgradeCta;

