import * as React from 'react';
import { Box, Divider, Typography } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { type PageAuditReport } from '../types';
import {
	auditStatusColor,
	auditStatusDisplayCounts,
	type AuditStatusGroup,
	auditStatusLabel,
} from '../utils/audit-status-summary';
import CountSummaryCircle from './count-summary-circle';

type Props = {
	report: PageAuditReport;
	onStatusClick: ( status: AuditStatusGroup ) => void;
};

const STATUS_ARIA_LABELS: Record< AuditStatusGroup, ( count: number ) => string > = {
	pass: ( count ) =>
		sprintf(
			/* translators: %d: number of passed audits. */
			__( '%d passed audits, view all', 'elementor' ),
			count
		),
	fail: ( count ) =>
		sprintf(
			/* translators: %d: number of failed audit violations. */
			__( '%d failed audits, view all', 'elementor' ),
			count
		),
	skipped: ( count ) =>
		sprintf(
			/* translators: %d: number of skipped audits. */
			__( '%d skipped audits, view all', 'elementor' ),
			count
		),
};

const STATUS_GROUPS = [ 'fail', 'pass', 'skipped' ] as const;

export default function AuditStatusesSection( { report, onStatusClick }: Props ) {
	const statusCounts = auditStatusDisplayCounts( report );

	return (
		<>
			<Typography variant="subtitle1" fontWeight="bold">
				{ __( 'Audit statuses', 'elementor' ) }
			</Typography>
			<Box sx={ { display: 'flex', justifyContent: 'space-around', gap: 2 } }>
				{ STATUS_GROUPS.map( ( status ) => (
					<CountSummaryCircle
						key={ status }
						ariaLabel={ STATUS_ARIA_LABELS[ status ]( statusCounts[ status ] ) }
						color={ auditStatusColor( status ) }
						count={ statusCounts[ status ] }
						label={ auditStatusLabel( status ) }
						onClick={ () => onStatusClick( status ) }
					/>
				) ) }
			</Box>
			<Divider />
		</>
	);
}
