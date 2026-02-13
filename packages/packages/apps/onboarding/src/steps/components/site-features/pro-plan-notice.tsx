import * as React from 'react';
import { useCallback } from 'react';
import { InfoCircleIcon } from '@elementor/icons';
import type { Theme } from '@elementor/ui';
import { Box, Button, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const COMPARE_PLANS_URL = 'https://elementor.com/pricing/?utm_source=onboarding&utm_medium=wp-dash';

const PRO_PLAN_NOTICE_BG = 'rgba(250, 228, 250, 0.6)';

const PRO_PLAN_NOTICE_TEXT = __( 'Some features you selected are available in Pro plan.', 'elementor' );
const COMPARE_PLANS_BUTTON_TEXT = __( 'Compare plans', 'elementor' );

const ProPlanNoticeRoot = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing( 1 ),
	padding: theme.spacing( 1, 2 ),
	borderRadius: theme.spacing( 1 ),
	backgroundColor: PRO_PLAN_NOTICE_BG,
	[ theme.breakpoints.down( 'sm' ) ]: {
		flexDirection: 'column',
		justifyContent: 'center',
	},
} ) );

export function ProPlanNotice() {
	const handleComparePlansClick = useCallback( () => {
		window.open( COMPARE_PLANS_URL, '_blank' );
	}, [] );

	return (
		<ProPlanNoticeRoot>
			<Stack
				sx={ ( theme: Theme ) => ( {
					display: 'flex',
					flexDirection: 'row',
					gap: theme.spacing( 1.5 ),
					alignItems: 'center',
				} ) }
			>
				<InfoCircleIcon
					sx={ ( theme: Theme ) => ( {
						fontSize: theme.spacing( 2.5 ),
						color: 'text.secondary',
					} ) }
				/>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={ ( theme: Theme ) => ( {
						fontSize: theme.spacing( 1.625 ),
					} ) }
				>
					{ PRO_PLAN_NOTICE_TEXT }
				</Typography>
			</Stack>
			<Button
				variant="text"
				size="small"
				color="promotion"
				onClick={ handleComparePlansClick }
				sx={ ( theme: Theme ) => ( {
					fontSize: theme.spacing( 1.625 ),
					textTransform: 'none',
					padding: theme.spacing( 0.5, 0.625 ),
					minWidth: 'auto',
				} ) }
			>
				{ COMPARE_PLANS_BUTTON_TEXT }
			</Button>
		</ProPlanNoticeRoot>
	);
}
