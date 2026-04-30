import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { closeDialog, openDialog } from '@elementor/editor-ui';
import { UploadIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ImportDesignSystemDialog } from '../import-design-system-dialog';
import { importStatus } from '../state';

export const TriggerButton = () => {
	const isImporting = useSyncExternalStore( importStatus.subscribe, importStatus.getSnapshot );

	const label = isImporting
		? __( 'Importing design system…', 'elementor' )
		: __( 'Import Design System', 'elementor' );

	const handleClick = () => {
		openDialog( {
			component: <ImportDesignSystemDialog onClose={ closeDialog } />,
		} );
	};

	return (
		<Tooltip title={ label } placement="top">
			<span>
				<IconButton size="tiny" disabled={ isImporting } aria-label={ label } onClick={ handleClick }>
					<UploadIcon fontSize="tiny" />
				</IconButton>
			</span>
		</Tooltip>
	);
};
