import { Button } from '@wordpress/components';

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
		</Button>
	);
};
