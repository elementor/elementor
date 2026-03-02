import * as React from 'react';
import { useCallback } from 'react';
import { InfoCircleIcon } from '@elementor/icons';
import type { Theme } from '@elementor/ui';
import { Box, Button, Stack, styled, Typography } from '@elementor/ui';

import { useOnboarding } from '../../../hooks/use-onboarding';
import { t } from '../../../utils/translations';

const PRO_PLAN_NOTICE_BG_LIGHT = 'rgba(250, 228, 250, 0.6)';
const PRO_PLAN_NOTICE_BG_DARK = '#fae4fa';
const PRO_PLAN_NOTICE_TEXT_COLOR = '#3f444b';

const ProPlanNoticeRoot = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing( 1 ),
	padding: theme.spacing( 1, 2 ),
	borderRadius: theme.spacing( 1 ),
	backgroundColor: theme.palette.mode === 'dark' ? PRO_PLAN_NOTICE_BG_DARK : PRO_PLAN_NOTICE_BG_LIGHT,
	[ theme.breakpoints.down( 'sm' ) ]: {
		flexDirection: 'column',
		justifyContent: 'center',
	},
} ) );

interface LicenseNoticeProps {
	planName: 'Pro' | 'One';
}

export function ProPlanNotice( { planName }: LicenseNoticeProps ) {
	const { urls } = useOnboarding();
	const comparePlansUrl = urls.comparePlans;

	const handleComparePlansClick = useCallback( () => {
		window.open( comparePlansUrl, '_blank' );
	}, [ comparePlansUrl ] );

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
						color: PRO_PLAN_NOTICE_TEXT_COLOR,
					} ) }
				/>
				<Typography
					variant="body2"
					sx={ ( theme: Theme ) => ( {
						fontSize: theme.spacing( 1.625 ),
						color: PRO_PLAN_NOTICE_TEXT_COLOR,
					} ) }
				>
					{ t( 'steps.site_features.plan_recommendation_prefix' ) } <strong>{ planName }</strong>{ ' ' }
					{ t( 'steps.site_features.plan_recommendation_suffix' ) }
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
				{ t( 'steps.site_features.compare_plans' ) }
			</Button>
		</ProPlanNoticeRoot>
	);
}
