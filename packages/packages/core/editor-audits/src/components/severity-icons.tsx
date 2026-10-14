import * as React from 'react';
import { AlertCircleIcon, AlertTriangleFilledIcon, BulbIcon } from '@elementor/icons';

import { type AuditSeverity } from '../types';

type IconComponent = typeof AlertTriangleFilledIcon;

type SeverityConfig = {
	Icon: IconComponent;
	color: 'error' | 'warning' | 'info';
};

const SEVERITY_CONFIG: Record< AuditSeverity, SeverityConfig > = {
	error: { Icon: AlertTriangleFilledIcon, color: 'error' },
	warning: { Icon: AlertCircleIcon, color: 'warning' },
	info: { Icon: BulbIcon, color: 'info' },
};

type Props = {
	severity: AuditSeverity;
};

const INFO_ICON_VERTICAL_NUDGE = 'translateY(-2px)';

export default function SeverityIcon( { severity }: Props ) {
	const { Icon, color } = SEVERITY_CONFIG[ severity ];
	const sx = 'info' === severity ? { transform: INFO_ICON_VERTICAL_NUDGE } : undefined;

	return <Icon fontSize="small" color={ color } sx={ sx } />;
}
