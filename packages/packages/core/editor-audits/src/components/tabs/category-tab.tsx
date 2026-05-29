import * as React from 'react';
import { Box, Collapse, Typography } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { type AuditCategory, type PageAuditReport } from '../../types';
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
	const [ showPassed, setShowPassed ] = React.useState( false );

	const totalViolations = failed.reduce(
		( n, r ) => n + ( r.result.status === 'fail' ? r.result.violations.length : 0 ),
		0
	);

	return (
		<Box>
			<Typography variant="body2" sx={ { px: 2, py: 1 } }>
				{ sprintf(
					/* translators: %d is the number of audit violations found in the current category. */
					__( '%d issues found', 'elementor' ),
					totalViolations
				) }
			</Typography>
			{ failed.map( ( r ) => (
				<ViolationRow
					key={ r.descriptor.id }
					descriptor={ r.descriptor }
					violations={ r.result.status === 'fail' ? r.result.violations : [] }
				/>
			) ) }
			{ skipped.map( ( r ) => (
				<Box
					key={ r.descriptor.id }
					sx={ { py: 1, px: 2, opacity: 0.5 } }
					title={ r.result.status === 'skipped' ? r.result.reason : '' }
				>
					<Typography variant="caption">
						{ r.descriptor.title } — { __( 'skipped', 'elementor' ) }
					</Typography>
				</Box>
			) ) }
			{ passed.length > 0 && (
				<Box sx={ { p: 1, cursor: 'pointer' } } onClick={ () => setShowPassed( ( v ) => ! v ) }>
					<Typography variant="caption" color="text.secondary">
						{ sprintf(
							/* translators: %d is the number of audits that passed. */
							__( '%d audits passed', 'elementor' ),
							passed.length
						) }
					</Typography>
				</Box>
			) }
			<Collapse in={ showPassed }>
				{ passed.map( ( r ) => (
					<Box key={ r.descriptor.id } sx={ { py: 0.5, px: 2, opacity: 0.6 } }>
						<Typography variant="caption">{ r.descriptor.title }</Typography>
					</Box>
				) ) }
			</Collapse>
		</Box>
	);
}
