import * as React from 'react';
import { Box, Typography } from '@elementor/ui';

import { type AuditSeverity, type PageAuditReport } from '../types';
import { ALL_SEVERITIES, countSeverities, severityPluralLabel } from '../utils/severity-counts';
import SeverityIcon from './severity-icons';

type Props = {
	report: PageAuditReport;
};

export default function SeveritySummaryCards( { report }: Props ) {
	const counts = countSeverities( report );

	return (
		<Box display="flex" gap={ 1.5 }>
			{ ALL_SEVERITIES.map( ( severity ) => (
				<SeverityCard key={ severity } severity={ severity } count={ counts[ severity ] } />
			) ) }
		</Box>
	);
}

type SeverityCardProps = {
	severity: AuditSeverity;
	count: number;
};

function SeverityCard( { severity, count }: SeverityCardProps ) {
	return (
		<Box
			display="flex"
			flex={ 1 }
			flexDirection="column"
			gap={ 1 }
			bgcolor="grey.50"
			borderRadius={ 1.5 }
			px={ 1.5 }
			py={ 1 }
		>
			<SeverityIcon severity={ severity } />
			<Box display="flex" flexDirection="column">
				<Typography variant="h5" fontWeight={ 700 } component="span">
					{ count }
				</Typography>
				<Typography variant="caption" color="text.secondary">
					{ severityPluralLabel( severity ) }
				</Typography>
			</Box>
		</Box>
	);
}
