import { Button } from '@wordpress/components';
import PropTypes from 'prop-types';

export const UpgradeButton = ( props ) => {
	const trackingClass = props.className || 'e-id-elementor-element-manager-button-upgrade';

	return (
		<Button
			{ ...props }
			variant="primary"
			target="_blank"
			rel={ 'noreferrer' }
			style={ {
				background: 'var(--e-a-btn-bg-accent, #93003f)',
			} }
			className={ trackingClass }
		>
		</Button>
	);
};

UpgradeButton.propTypes = {
	className: PropTypes.string,
};
