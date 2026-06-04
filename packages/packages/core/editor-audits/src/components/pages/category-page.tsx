import * as React from 'react';
import { ArrowLeftIcon } from '@elementor/icons';
import { Box, IconButton, Rotate, Typography, useTheme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { CATEGORY_LABELS } from '../../constants';
import { sortFailedAuditResults } from '../../lib/sort-failed-audits';
import { type AuditCategory, type PageAuditReport } from '../../types';
import { CATEGORY_ICONS } from '../category-icons';
import StatusSection from '../status-section';
import ViolationRow from '../violation-row';

type Props = {
	category: AuditCategory;
	report: PageAuditReport;
	onBack: () => void;
};

export default function CategoryPage( { category, report, onBack }: Props ) {
	const isRtl = 'rtl' === useTheme().direction;
	const Icon = CATEGORY_ICONS[ category ];
	const inCategory = report.auditResults.filter( ( r ) => r.descriptor.categories.includes( category ) );
	const failed = sortFailedAuditResults( inCategory.filter( ( r ) => r.result.status === 'fail' ) );
	const passed = inCategory.filter( ( r ) => r.result.status === 'pass' );

	const totalViolations = failed.reduce(
		( n, r ) => n + ( r.result.status === 'fail' ? r.result.violations.length : 0 ),
		0
	);

	return (
		<>
			<Box
				sx={ {
					display: 'flex',
					alignItems: 'center',
					gap: 0.5,
					p: 1,
				} }
			>
				<IconButton size="small" onClick={ onBack } aria-label={ __( 'Back to all issues', 'elementor' ) }>
					<Rotate in={ isRtl }>
						<ArrowLeftIcon fontSize="small" />
					</Rotate>
				</IconButton>
				<Icon fontSize="small" color="action" />
				<Typography variant="subtitle2" fontWeight="bold">
					{ CATEGORY_LABELS[ category ] }
				</Typography>
			</Box>
			<Box sx={ { p: 1 } }>
				<StatusSection
					label={ __( 'Failed audits', 'elementor' ) }
					count={ totalViolations }
					color="error"
					defaultExpanded
				>
					{ failed.map( ( r ) => (
						<ViolationRow
							key={ r.descriptor.id }
							descriptor={ r.descriptor }
							violations={ r.result.status === 'fail' ? r.result.violations : [] }
						/>
					) ) }
				</StatusSection>
				<StatusSection label={ __( 'Passed audits', 'elementor' ) } count={ passed.length } color="success">
					{ passed.map( ( r ) => (
						<ViolationRow key={ r.descriptor.id } descriptor={ r.descriptor } />
					) ) }
				</StatusSection>
			</Box>
		</>
	);
}
