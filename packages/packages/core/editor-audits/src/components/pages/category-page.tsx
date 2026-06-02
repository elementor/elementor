import * as React from 'react';
import { ArrowLeftIcon } from '@elementor/icons';
import { Box, IconButton, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditCategory, type PageAuditReport } from '../../types';
import { CATEGORY_ICONS } from '../category-icons';
import StatusSection from '../status-section';
import ViolationRow from '../violation-row';

type Props = {
	category: AuditCategory;
	report: PageAuditReport;
	onBack: () => void;
};

const CATEGORY_LABELS: Record< AuditCategory, string > = {
	health: __( 'Health', 'elementor' ),
	seo: __( 'SEO', 'elementor' ),
	accessibility: __( 'Accessibility', 'elementor' ),
	performance: __( 'Performance', 'elementor' ),
	compliance: __( 'Compliance', 'elementor' ),
};

export default function CategoryPage( { category, report, onBack }: Props ) {
	const Icon = CATEGORY_ICONS[ category ];
	const inCategory = report.auditResults.filter( ( r ) => r.descriptor.categories.includes( category ) );
	const failed = inCategory.filter( ( r ) => r.result.status === 'fail' );
	const passed = inCategory.filter( ( r ) => r.result.status === 'pass' );
	const skipped = inCategory.filter( ( r ) => r.result.status === 'skipped' );

	const totalViolations = failed.reduce(
		( n, r ) => n + ( r.result.status === 'fail' ? r.result.violations.length : 0 ),
		0
	);

	return (
		<Box>
			<Box
				sx={ {
					display: 'flex',
					alignItems: 'center',
					gap: 0.5,
					px: 1,
					py: 0.5,
					borderBottom: 1,
					borderColor: 'divider',
				} }
			>
				<IconButton size="small" onClick={ onBack } aria-label={ __( 'Back', 'elementor' ) }>
					<ArrowLeftIcon fontSize="small" />
				</IconButton>
				<Icon fontSize="small" color="action" />
				<Typography variant="subtitle2">{ CATEGORY_LABELS[ category ] }</Typography>
			</Box>
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
		</Box>
	);
}
