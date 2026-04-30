import * as React from 'react';
import { closeDialog, openDialog } from '@elementor/editor-ui';
import { UploadIcon } from '@elementor/icons';
import { useIsMutating } from '@elementor/query';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { IMPORT_DESIGN_SYSTEM_MUTATION_KEY } from '../hooks/use-import-request';
import { ImportDesignSystemDialog } from '../import-design-system-dialog';

export const TriggerButton = () => {
	const isImporting = useIsMutating( { mutationKey: [ ...IMPORT_DESIGN_SYSTEM_MUTATION_KEY ] } ) > 0;

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
