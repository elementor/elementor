import * as React from 'react';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type PageAuditReport } from '../../types';
import {
	auditStatusColor,
	type AuditStatusGroup,
	auditStatusLabel,
	partitionAuditResults,
} from '../../utils/audit-status-summary';
import StatusSection from '../status-section';
import SubpageHeader from '../subpage-header';
import ViolationRow from '../violation-row';

type Props = {
	initialExpandedStatus?: AuditStatusGroup;
	onBack: () => void;
	report: PageAuditReport;
};

export default function AllAuditsPage( { initialExpandedStatus, onBack, report }: Props ) {
	const { failed, passed, skipped, totalViolations } = partitionAuditResults( report );
	const expandFail = ! initialExpandedStatus || initialExpandedStatus === 'fail';
	const expandPass = initialExpandedStatus === 'pass';
	const expandSkipped = initialExpandedStatus === 'skipped';

	return (
		<Box key={ initialExpandedStatus ?? 'default' }>
			<SubpageHeader title={ __( 'All audits', 'elementor' ) } onBack={ onBack } />
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
