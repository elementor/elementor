import * as React from 'react';
import { AlertCircleIcon, AlertTriangleFilledIcon, InfoCircleIcon } from '@elementor/icons';

import { type AuditSeverity } from '../types';

type IconComponent = typeof AlertTriangleFilledIcon;

type SeverityConfig = {
	Icon: IconComponent;
	color: 'error' | 'warning' | 'info';
};

const SEVERITY_CONFIG: Record< AuditSeverity, SeverityConfig > = {
	error: { Icon: AlertTriangleFilledIcon, color: 'error' },
	warning: { Icon: AlertCircleIcon, color: 'warning' },
	info: { Icon: InfoCircleIcon, color: 'info' },
};

type Props = {
	severity: AuditSeverity;
};

export default function SeverityIcon( { severity }: Props ) {
	const { Icon, color } = SEVERITY_CONFIG[ severity ];
	return <Icon fontSize="small" color={ color } />;
}
