import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const UpgradeButton = ( props ) => {
	return (
		<Button
			{ ...props }
			variant="primary"
			target="_blank"
			rel={ 'noreferrer' }
			style={ {
				background: 'var(--e-a-btn-bg-accent, #93003f)',
			} }
		>
			{ __( 'Upgrade Now', 'elementor' ) }
		</Button>
	);
};
