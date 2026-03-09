import * as React from 'react';
import { ArrowUpRightIcon } from '@elementor/icons';
import { Box, Link, Stack, styled, Typography, useTheme } from '@elementor/ui';

import { useOnboarding } from '../../../hooks/use-onboarding';
import { t } from '../../../utils/translations';

const PRO_PLAN_NOTICE_BG_LIGHT = '#FAE4FA';
const PRO_PLAN_NOTICE_BG_DARK = '#491146';

const ProPlanNoticeRoot = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing( 1 ),
	padding: theme.spacing( 1.5, 3 ),
	borderRadius: theme.spacing( 2 ),
	backgroundColor: theme.palette.mode === 'dark' ? PRO_PLAN_NOTICE_BG_DARK : PRO_PLAN_NOTICE_BG_LIGHT,
	width: 'max-content',
	maxWidth: '100%',
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
	const theme = useTheme();

	const isOne = 'One' === planName;

	return (
		<ProPlanNoticeRoot>
			<Stack direction="row" spacing={ 1.5 } alignItems="center">
				<Typography variant="body2" color="text.primary" fontSize={ theme.spacing( 2 ) }>
					{ isOne
						? t( 'steps.site_features.plan_recommendation_one' )
						: t( 'steps.site_features.plan_recommendation_pro' ) }
				</Typography>
			</Stack>
			<Link
				href={ comparePlansUrl }
				target="_blank"
				color="promotion.main"
				sx={ {
					display: 'flex',
					alignItems: 'center',
					gap: theme.spacing( 0.25 ),
					fontSize: theme.spacing( 2 ),
					'&:hover': {
						textDecoration: 'underline',
						textDecorationColor: 'rgba(147, 0, 63, 0.4)',
					},
					'& > svg': {
						fontSize: 'inherit',
					},
				} }
			>
				{ t( 'steps.site_features.compare_plans' ) }
				<ArrowUpRightIcon />
			</Link>
		</ProPlanNoticeRoot>
	);
}
