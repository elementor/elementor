import * as React from 'react';
import { useCallback } from 'react';
import { InfoCircleIcon } from '@elementor/icons';
import type { Theme } from '@elementor/ui';
import { Box, Button, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const COMPARE_PLANS_URL =
	'https://elementor.com/pricing/?utm_source=onboarding&utm_medium=wp-dash';

const PRO_PLAN_NOTICE_BG = 'rgba(250, 228, 250, 0.6)';

const ProPlanNoticeRoot = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing( 1 ),
	padding: theme.spacing( 1, 2 ),
	borderRadius: theme.spacing( 1 ),
	backgroundColor: PRO_PLAN_NOTICE_BG,
} ) );

export function ProPlanNotice() {
	const handleComparePlansClick = useCallback( () => {
		window.open( COMPARE_PLANS_URL, '_blank' );
	}, [] );

	return (
		<ProPlanNoticeRoot>
			<InfoCircleIcon
				sx={ ( theme: Theme ) => ( {
					fontSize: theme.spacing( 2.5 ),
					color: 'text.secondary',
				} ) }
			/>
			<Typography
				variant="body2"
				color="text.secondary"
				sx={ ( theme: Theme ) => ( { fontSize: theme.spacing( 1.625 ) } ) }
			>
				{ __( 'Some features you selected are available in Pro plan.', 'elementor' ) }
			</Typography>
			<Button
				variant="text"
				size="small"
				onClick={ handleComparePlansClick }
				sx={ ( theme: Theme ) => ( {
					color: 'promotion.main',
					fontSize: theme.spacing( 1.625 ),
					textTransform: 'none',
					padding: theme.spacing( 0.5, 0.625 ),
					minWidth: 'auto',
				} ) }
			>
				{ __( 'Compare plans', 'elementor' ) }
			</Button>
		</ProPlanNoticeRoot>
	);
}
