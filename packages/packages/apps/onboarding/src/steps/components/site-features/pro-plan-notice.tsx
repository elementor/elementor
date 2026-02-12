import * as React from 'react';
import { useCallback } from 'react';
import { InfoCircleIcon } from '@elementor/icons';
import { Box, Button, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const COMPARE_PLANS_URL =
	'https://elementor.com/pricing/?utm_source=onboarding&utm_medium=wp-dash';

const PRO_PLAN_NOTICE_BG = 'rgba(250, 228, 250, 0.6)';

const ProPlanNoticeRoot = styled( Box )( () => ( {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	padding: '8px 16px',
	borderRadius: 8,
	backgroundColor: PRO_PLAN_NOTICE_BG,
} ) );

export function ProPlanNotice() {
	const handleComparePlansClick = useCallback( () => {
		window.open( COMPARE_PLANS_URL, '_blank' );
	}, [] );

	return (
		<ProPlanNoticeRoot>
			<InfoCircleIcon sx={ { fontSize: 20, color: 'text.secondary' } } />
			<Typography
				variant="body2"
				color="text.secondary"
				sx={ { fontSize: 13 } }
			>
				{ __(
					'Some features you selected are available in Pro plan.',
					'elementor'
				) }
			</Typography>
			<Button
				variant="text"
				size="small"
				onClick={ handleComparePlansClick }
				sx={ {
					color: 'promotion.main',
					fontSize: 13,
					textTransform: 'none',
					padding: '4px 5px',
					minWidth: 'auto',
				} }
			>
				{ __( 'Compare plans', 'elementor' ) }
			</Button>
		</ProPlanNoticeRoot>
	);
}
