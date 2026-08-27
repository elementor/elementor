import * as React from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PROMOTIONS } from '../register-promotions';
import { type PageAuditReport } from '../types';
import { findAuditRun } from '../utils/find-audit-run';
import PromotionCard from './promotion-card';

type Props = {
	report: PageAuditReport;
};

export default function Promotions( { report }: Props ) {
	const cards = PROMOTIONS.flatMap( ( config ) => {
		const run = findAuditRun( report, config.auditId );

		if ( ! run || run.result.status !== 'fail' ) {
			return [];
		}

		const subtitle = config.formatSubtitle( run );

		if ( ! subtitle ) {
			return [];
		}

		const ctaUrl = config.getCtaUrl( run );

		return [
			{
				config,
				ctaUrl,
				key: config.auditId,
				run,
				subtitle,
			},
		];
	} );

	if ( cards.length === 0 ) {
		return null;
	}

	return (
		<>
			<Typography variant="subtitle1" fontWeight="bold">
				{ __( 'Quick wins', 'elementor' ) }
			</Typography>
			<Box sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
				{ cards.map( ( { config, ctaUrl, key, run, subtitle } ) => (
					<PromotionCard
						key={ key }
						icon={ config.icon }
						title={ run.audit.title }
						subtitle={ subtitle }
						ctaLabel={ config.ctaLabel }
						ctaDisabled={ ! ctaUrl }
						onCtaClick={ () => {
							if ( ctaUrl ) {
								window.open( ctaUrl, '_blank' );
							}
						} }
					/>
				) ) }
			</Box>
		</>
	);
}
