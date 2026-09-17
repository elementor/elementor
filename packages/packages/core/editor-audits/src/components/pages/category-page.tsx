import * as React from 'react';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { CATEGORY_LABELS } from '../../constants';
import { type AuditCategory, type PageAuditReport } from '../../types';
import { partitionAuditResults } from '../../utils/audit-status-summary';
import { CATEGORY_ICONS } from '../category-icons';
import StatusSection from '../status-section';
import SubpageHeader from '../subpage-header';
import ViolationRow from '../violation-row';

type Props = {
	category: AuditCategory;
	report: PageAuditReport;
	onBack: () => void;
};

export default function CategoryPage( { category, report, onBack }: Props ) {
	const Icon = CATEGORY_ICONS[ category ];
	const { failed, passed, totalViolations } = partitionAuditResults( report, { category } );

	return (
		<>
			<SubpageHeader
				title={ CATEGORY_LABELS[ category ] }
				onBack={ onBack }
				backLabel={ __( 'Back to all issues', 'elementor' ) }
				icon={ <Icon fontSize="small" color="action" /> }
			/>
			<Box sx={ { p: 1 } }>
				<StatusSection
					label={ __( 'Failed audits', 'elementor' ) }
					count={ totalViolations }
					color="error"
					defaultExpanded
				>
					{ failed.map( ( r ) => (
						<ViolationRow key={ r.audit.id } audit={ r.audit } violations={ r.result.violations } />
					) ) }
				</StatusSection>
				<StatusSection label={ __( 'Passed audits', 'elementor' ) } count={ passed.length } color="success">
					{ passed.map( ( r ) => (
						<ViolationRow key={ r.audit.id } audit={ r.audit } />
					) ) }
				</StatusSection>
			</Box>
		</>
	);
}
