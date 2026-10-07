import * as React from 'react';
import { useFloatingPanelZIndex } from '@elementor/editor-floating-panels';
import { ReloadIcon } from '@elementor/icons';
import { Badge, Button, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { AUDIT_PANEL_ID } from '../constants';

type Props = {
	hasScanned: boolean;
	isStale: boolean;
	disabled: boolean;
	onClick: () => void;
};

export default function RescanButton( { hasScanned, isStale, disabled, onClick }: Props ) {
	const panelZIndex = useFloatingPanelZIndex( AUDIT_PANEL_ID );

	return (
		<Tooltip
			title={ isStale ? __( 'Page content changed - rescan advised', 'elementor' ) : '' }
			PopperProps={ { sx: { zIndex: panelZIndex } } }
		>
			<Badge variant="dot" color="warning" invisible={ ! isStale } overlap="rectangular">
				<Button
					variant="contained"
					size="small"
					startIcon={ hasScanned ? <ReloadIcon fontSize="small" /> : undefined }
					onClick={ onClick }
					disabled={ disabled }
				>
					{ hasScanned ? __( 'Rescan', 'elementor' ) : __( 'Run page audit', 'elementor' ) }
				</Button>
			</Badge>
		</Tooltip>
	);
}
