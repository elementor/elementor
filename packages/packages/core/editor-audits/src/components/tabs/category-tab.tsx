import * as React from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditCategory, type PageAuditReport } from '../../types';
import StatusSection from './status-section';
import ViolationRow from './violation-row';

type Props = {
	category: AuditCategory;
	report: PageAuditReport;
};

export default function CategoryTab( { category, report }: Props ) {
	const inCategory = report.auditResults.filter( ( r ) => r.descriptor.categories.includes( category ) );
	const failed = inCategory.filter( ( r ) => r.result.status === 'fail' );
	const passed = inCategory.filter( ( r ) => r.result.status === 'pass' );
	const skipped = inCategory.filter( ( r ) => r.result.status === 'skipped' );

	// Failed badge intentionally shows the total violation count, while passed/skipped
	// badges show the number of audits — per product decision.
	const totalViolations = failed.reduce(
		( n, r ) => n + ( r.result.status === 'fail' ? r.result.violations.length : 0 ),
		0
	);

	return (
		<Box sx={ { p: 1 } }>
			<StatusSection label={ __( 'Failed audits', 'elementor' ) } count={ totalViolations } defaultExpanded>
				{ failed.map( ( r ) => (
					<ViolationRow
						key={ r.descriptor.id }
						descriptor={ r.descriptor }
						violations={ r.result.status === 'fail' ? r.result.violations : [] }
					/>
				) ) }
			</StatusSection>
			<StatusSection label={ __( 'Passed audits', 'elementor' ) } count={ passed.length }>
				{ passed.map( ( r ) => (
					<Box key={ r.descriptor.id } sx={ { py: 0.5, px: 1.5 } }>
						<Typography variant="caption">{ r.descriptor.title }</Typography>
					</Box>
				) ) }
			</StatusSection>
			<StatusSection label={ __( 'Skipped audits', 'elementor' ) } count={ skipped.length }>
				{ skipped.map( ( r ) => (
					<Box key={ r.descriptor.id } sx={ { py: 0.5, px: 1.5 } }>
						<Typography variant="caption">
							{ r.result.status === 'skipped' && r.result.reason
								? `${ r.descriptor.title } — ${ r.result.reason }`
								: r.descriptor.title }
						</Typography>
					</Box>
				) ) }
			</StatusSection>
		</Box>
	);
}
