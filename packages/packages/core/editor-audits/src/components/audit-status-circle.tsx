import * as React from 'react';

import { auditStatusColor, type AuditStatusGroup, auditStatusLabel } from '../lib/audit-status-summary';
import CountSummaryCircle from './count-summary-circle';

type Props = {
	ariaLabel: string;
	count: number;
	onClick: () => void;
	status: AuditStatusGroup;
};

export default function AuditStatusCircle( { ariaLabel, count, onClick, status }: Props ) {
	return (
		<CountSummaryCircle
			ariaLabel={ ariaLabel }
			color={ auditStatusColor( status ) }
			count={ count }
			label={ auditStatusLabel( status ) }
			onClick={ onClick }
		/>
	);
}
