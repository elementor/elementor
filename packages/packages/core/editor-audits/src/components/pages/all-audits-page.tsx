import * as React from 'react';
import { ArrowLeftIcon } from '@elementor/icons';
import { Box, IconButton, Rotate, Typography, useTheme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { sortFailedAuditResults } from '../../lib/sort-failed-audits';
import { type PageAuditReport } from '../../types';
import StatusSection from '../status-section';
import ViolationRow from '../violation-row';

type Props = {
	report: PageAuditReport;
	onBack: () => void;
};

export default function AllAuditsPage( { report, onBack }: Props ) {
	const isRtl = 'rtl' === useTheme().direction;
	const failed = sortFailedAuditResults( report.auditResults.filter( ( r ) => r.result.status === 'fail' ) );
	const passed = report.auditResults.filter( ( r ) => r.result.status === 'pass' );
	const skipped = report.auditResults.filter( ( r ) => r.result.status === 'skipped' );

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
				<Typography variant="subtitle2" fontWeight="bold">
					{ __( 'All audits', 'elementor' ) }
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
				<StatusSection label={ __( 'Skipped audits', 'elementor' ) } count={ skipped.length }>
					{ skipped.map( ( r ) => (
						<Box
							key={ r.descriptor.id }
							sx={ {
								borderBottom: 1,
								borderColor: 'divider',
								paddingBlock: 1,
							} }
						>
							<Typography variant="body2">
								{ r.result.status === 'skipped' && r.result.reason
									? `${ r.descriptor.title } — ${ r.result.reason }`
									: r.descriptor.title }
							</Typography>
						</Box>
					) ) }
				</StatusSection>
			</Box>
		</>
	);
}
