import * as React from 'react';
import { useCallback } from 'react';
import { ArrowUpRightIcon, InfoCircleIcon } from '@elementor/icons';
import type { Theme } from '@elementor/ui';
import { Box, Link, Stack, styled, Typography } from '@elementor/ui';

import { useOnboarding } from '../../../hooks/use-onboarding';
import { t } from '../../../utils/translations';

const PRO_PLAN_NOTICE_BG = '#FAE4FA';

const ProPlanNoticeRoot = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing( 1 ),
	padding: theme.spacing( 1.5, 3 ),
	borderRadius: theme.spacing( 1 ),
	backgroundColor: PRO_PLAN_NOTICE_BG,
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
				<Typography
					variant="body2"
					color="text.primary"
					sx={ ( theme: Theme ) => ( {
						fontSize: theme.spacing( 2 ),
					} ) }
				>
					{ t( 'steps.site_features.plan_recommendation_prefix' ) } { planName }{ ' ' }
					{ t( 'steps.site_features.plan_recommendation_suffix' ) }
				</Typography>
			</Stack>
			<Link
				href={ comparePlansUrl }
				target="_blank"
				color="promotion.main"
				fontSize={ 16 }
				sx={ ( theme: Theme ) => ( {
					display: 'flex',
					alignItems: 'center',
					gap: theme.spacing( 0.5 ),
				} ) }
			>
				{ t( 'steps.site_features.compare_plans' ) }
				<ArrowUpRightIcon sx={ { fontSize: 'inherit' } } />
			</Link>
		</ProPlanNoticeRoot>
	);
}
