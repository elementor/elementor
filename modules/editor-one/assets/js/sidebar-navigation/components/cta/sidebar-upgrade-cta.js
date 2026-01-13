import { CrownFilledIcon } from '@elementor/icons';
import PropTypes from 'prop-types';
import { CtaButton, CtaContainer, CollapsedCtaButton, CollapsedCtaContainer } from './styled-components';

const SidebarUpgradeCta = ( { upgradeUrl, upgradeText, hasPro, collapsed } ) => {
	const isPro = true === hasPro || '1' === hasPro || 'true' === hasPro;

	if ( isPro ) {
		return null;
	}

	const handleUpgradeClick = () => {
		window.open( upgradeUrl, '_blank' );
	};

	if ( collapsed ) {
		return (
			<CollapsedCtaContainer>
				<CollapsedCtaButton onClick={ handleUpgradeClick }>
					<CrownFilledIcon />
				</CollapsedCtaButton>
			</CollapsedCtaContainer>
		);
	}

	return (
		<CtaContainer>
			<CtaButton
				startIcon={ <CrownFilledIcon /> }
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
	collapsed: PropTypes.bool,
};

export default SidebarUpgradeCta;

