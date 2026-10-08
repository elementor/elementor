import * as React from 'react';
import { ShieldCheckIcon } from '@elementor/icons';
import { __useSelector as useSelector } from '@elementor/store';
import { Badge } from '@elementor/ui';

import { type GlobalState, selectIsStale } from '../store';

export default function AuditToggleIcon() {
	const isStale = useSelector( ( state: GlobalState ) => selectIsStale( state ) );

	return (
		<Badge
			variant="dot"
			color="warning"
			invisible={ ! isStale }
			overlap="circular"
			slotProps={ { badge: { 'data-testid': 'audit-stale-indicator' } } }
		>
			<ShieldCheckIcon />
		</Badge>
	);
}
