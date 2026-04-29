import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { UploadIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { importDialogState } from '../state';

export const TriggerButton = () => {
	const { isImporting } = useSyncExternalStore( importDialogState.subscribe, importDialogState.getSnapshot );

	const label = isImporting
		? __( 'Importing design system…', 'elementor' )
		: __( 'Import Design System', 'elementor' );

	return (
		<Tooltip title={ label } placement="top">
			<span>
				<IconButton
					size="tiny"
					disabled={ isImporting }
					aria-label={ label }
					onClick={ () => importDialogState.open() }
				>
					<UploadIcon fontSize="tiny" />
				</IconButton>
			</span>
		</Tooltip>
	);
};
