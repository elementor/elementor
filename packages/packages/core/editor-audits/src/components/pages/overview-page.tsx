import * as React from 'react';
import { Box, Chip, Divider, Typography } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { ALL_CATEGORIES, CATEGORY_LABELS } from '../../constants';
import { auditStatusDisplayCounts, type AuditStatusGroup } from '../../lib/audit-status-summary';
import { scoreStatusColor, scoreStatusLabel } from '../../lib/score-thresholds';
import {
	ALL_SEVERITIES,
	countSeverities,
	severityPluralLabel,
	severityRemainingCountLabel,
} from '../../lib/severity-counts';
import { type AuditCategory, type PageAuditReport } from '../../types';
import AuditStatusCircle from '../audit-status-circle';
import ScoreBar from '../score-bar';
import ScoreCircle from '../score-circle';
import SeverityIcon from '../severity-icons';

type Props = {
	onCategoryClick: ( category: AuditCategory ) => void;
	onStatusClick: ( status: AuditStatusGroup ) => void;
	report: PageAuditReport;
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

const STATUS_GROUPS: AuditStatusGroup[] = [ 'fail', 'pass', 'skipped' ];

export default function OverviewPage( { onCategoryClick, onStatusClick, report }: Props ) {
	const populatedCategories = ALL_CATEGORIES.filter( ( c ) => report.categories[ c ].total > 0 );
	const severityCounts = countSeverities( report );
	const statusCounts = auditStatusDisplayCounts( report );

	return (
		<Box sx={ { display: 'flex', flexDirection: 'column', gap: 4, p: 2 } }>
			<Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
				<ScoreCircle score={ report.overall } />
				<Box sx={ { display: 'flex', flexDirection: 'column', gap: 0.5 } }>
					<Chip
						label={ scoreStatusLabel( report.overall ) }
						color={ scoreStatusColor( report.overall ) }
						variant="standard"
						size="small"
						sx={ { fontWeight: 600, alignSelf: 'flex-start' } }
					/>
					<Typography variant="body2" color="text.secondary">
						{ __( 'Overall site score', 'elementor' ) }
					</Typography>
				</Box>
			</Box>
			<Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
				{ populatedCategories.map( ( category ) => (
					<ScoreBar
						key={ category }
						label={ CATEGORY_LABELS[ category ] }
						score={ report.categories[ category ].score }
						onClick={ () => onCategoryClick( category ) }
					/>
				) ) }
			</Box>
			<Divider />
			<Typography variant="subtitle1" fontWeight="bold">
				{ __( 'Audit statuses', 'elementor' ) }
			</Typography>
			<Box
				sx={ {
					display: 'flex',
					justifyContent: 'space-around',
					gap: 2,
				} }
			>
				{ STATUS_GROUPS.map( ( status ) => (
					<AuditStatusCircle
						key={ status }
						ariaLabel={ STATUS_ARIA_LABELS[ status ]( statusCounts[ status ] ) }
						count={ statusCounts[ status ] }
						onClick={ () => onStatusClick( status ) }
						status={ status }
					/>
				) ) }
			</Box>
			<Divider />
			<Typography variant="subtitle1" fontWeight="bold">
				{ __( 'Remaining issues', 'elementor' ) }
			</Typography>
			<Box
				component="ul"
				sx={ {
					display: 'flex',
					flexDirection: 'column',
					gap: 1,
					listStyle: 'none',
					m: 0,
					p: 0,
				} }
			>
				{ ALL_SEVERITIES.map( ( severity ) => {
					const count = severityCounts[ severity ];

					return (
						<Box
							aria-label={ severityRemainingCountLabel( severity, count ) }
							component="li"
							key={ severity }
							sx={ {
								alignItems: 'center',
								display: 'flex',
								gap: 0.5,
							} }
						>
							<SeverityIcon severity={ severity } />
							<Typography variant="body2" fontWeight="bold">
								{ count }
							</Typography>
							<Typography variant="body2">{ severityPluralLabel( severity ) }</Typography>
						</Box>
					);
				} ) }
			</Box>
		</Box>
	);
}
