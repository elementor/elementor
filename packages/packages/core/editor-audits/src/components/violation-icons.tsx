import * as React from 'react';
import { FileSettingsIcon, SettingsIcon, ShieldCheckIcon } from '@elementor/icons';
import { Box } from '@elementor/ui';

import { type AuditViolation } from '../types';

type Props = {
	violation: AuditViolation;
	widgetIcon: string | null;
};

export default function ViolationIcon( { violation, widgetIcon }: Props ) {
	if ( widgetIcon ) {
		return (
			<Box
				component="i"
				className={ widgetIcon }
				aria-hidden={ true }
				sx={ { fontSize: 'inherit', width: '1em', textAlign: 'center' } }
			/>
		);
	}

	if ( violation.targetHint === 'page-settings' ) {
		return <FileSettingsIcon fontSize="inherit" aria-hidden={ true } />;
	}

	if ( violation.targetHint === 'site-settings' || violation.targetHint === 'site-identity-settings' ) {
		return <SettingsIcon fontSize="inherit" aria-hidden={ true } />;
	}

	return <ShieldCheckIcon fontSize="inherit" aria-hidden={ true } />;
}
