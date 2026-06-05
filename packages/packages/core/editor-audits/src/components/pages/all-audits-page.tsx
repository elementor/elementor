import * as React from 'react';
import { ArrowLeftIcon } from '@elementor/icons';
import { Box, IconButton, Rotate, Typography, useTheme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	auditStatusColor,
	type AuditStatusGroup,
	auditStatusLabel,
	partitionAuditResults,
} from '../../lib/audit-status-summary';
import { type PageAuditReport } from '../../types';
import StatusSection from '../status-section';
import ViolationRow from '../violation-row';

type Props = {
	initialExpandedStatus?: AuditStatusGroup;
	onBack: () => void;
	report: PageAuditReport;
};

export default function AllAuditsPage( { initialExpandedStatus, onBack, report }: Props ) {
	const isRtl = 'rtl' === useTheme().direction;
	const { failed, passed, skipped, totalViolations } = partitionAuditResults( report );
	const expandFail = ! initialExpandedStatus || initialExpandedStatus === 'fail';
	const expandPass = initialExpandedStatus === 'pass';
	const expandSkipped = initialExpandedStatus === 'skipped';

	return (
		<Box key={ initialExpandedStatus ?? 'default' }>
			<Box
				sx={ {
					display: 'flex',
					alignItems: 'center',
					gap: 0.5,
					p: 1,
				} }
			>
				<IconButton size="small" onClick={ onBack } aria-label={ __( 'Back', 'elementor' ) }>
					<Rotate in={ isRtl }>
						<ArrowLeftIcon fontSize="small" />
					</Rotate>
				</IconButton>
				<Typography variant="subtitle2" fontWeight="bold">
					{ __( 'All audits', 'elementor' ) }
				</Typography>
			</Box>
			<Box sx={ { p: 1 } }>
				<StatusSection
					label={ auditStatusLabel( 'fail' ) }
					count={ totalViolations }
					color={ auditStatusColor( 'fail' ) }
					defaultExpanded={ expandFail }
				>
					{ failed.map( ( r ) => (
						<ViolationRow
							key={ r.audit.id }
							audit={ r.audit }
							violations={ r.result.status === 'fail' ? r.result.violations : [] }
						/>
					) ) }
				</StatusSection>
				<StatusSection
					label={ auditStatusLabel( 'pass' ) }
					count={ passed.length }
					color={ auditStatusColor( 'pass' ) }
					defaultExpanded={ expandPass }
				>
					{ passed.map( ( r ) => (
						<ViolationRow key={ r.audit.id } audit={ r.audit } />
					) ) }
				</StatusSection>
				<StatusSection
					label={ auditStatusLabel( 'skipped' ) }
					count={ skipped.length }
					color={ auditStatusColor( 'skipped' ) }
					defaultExpanded={ expandSkipped }
				>
					{ skipped.map( ( r ) => (
						<ViolationRow
							key={ r.audit.id }
							audit={ r.audit }
							skipReason={ r.result.status === 'skipped' ? r.result.reason : undefined }
						/>
					) ) }
				</StatusSection>
			</Box>
		</Box>
	);
}
