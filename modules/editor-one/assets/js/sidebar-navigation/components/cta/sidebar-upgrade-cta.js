import CrownIcon from '@elementor/icons/CrownIcon';
import PropTypes from 'prop-types';
import { CtaButton, CtaContainer } from './styled-components';

const SidebarUpgradeCta = ( { upgradeUrl, upgradeText, hasPro } ) => {
	const isPro = true === hasPro || '1' === hasPro || 'true' === hasPro;

	if ( isPro ) {
		return null;
	}

	const handleUpgradeClick = () => {
		window.open( upgradeUrl, '_blank' );
	};

	return (
		<CtaContainer>
			<CtaButton
				startIcon={ <CrownIcon /> }
				onClick={ handleUpgradeClick }
				variant="outlined"
				color="promotion"
				fullWidth
			>
				{ upgradeText }
			</CtaButton>
		</CtaContainer>
	);
};

SidebarUpgradeCta.propTypes = {
	upgradeUrl: PropTypes.string.isRequired,
	upgradeText: PropTypes.string.isRequired,
	hasPro: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ).isRequired,
};

export default SidebarUpgradeCta;

