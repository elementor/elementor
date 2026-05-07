import * as React from 'react';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import { closeDialog, openDialog } from '@elementor/editor-ui';
import { DotsVerticalIcon, DownloadIcon, UploadIcon } from '@elementor/icons';
import { useIsMutating } from '@elementor/query';
import {
	bindMenu,
	bindTrigger,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Tooltip,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { downloadBlob } from '../export/download';
import { notifyExportFailure, notifyExportInProgress, notifyExportSuccess } from '../export/export-notifications';
import { EXPORT_DESIGN_SYSTEM_MUTATION_KEY, useExportRequest } from '../export/hooks/use-export-request';
import { IMPORT_DESIGN_SYSTEM_MUTATION_KEY } from '../import/hooks/use-import-request';
import { ImportDesignSystemDialog } from '../import/import-design-system-dialog';
import { trackDesignSystem } from '../import/tracking';

const POPUP_STATE_ID = 'design-system-header-menu';

export const DesignSystemHeaderMenu = () => {
	const { isAdmin } = useCurrentUserCapabilities();
	const popupState = usePopupState( { variant: 'popover', popupId: POPUP_STATE_ID } );
	const exportMutation = useExportRequest();

	const isImporting = useIsMutating( { mutationKey: [ IMPORT_DESIGN_SYSTEM_MUTATION_KEY ] } ) > 0;
	const isExporting = useIsMutating( { mutationKey: [ EXPORT_DESIGN_SYSTEM_MUTATION_KEY ] } ) > 0;

	const triggerProps = bindTrigger( popupState );

	const handleImport = () => {
		popupState.close();
		trackDesignSystem( { event: 'importOpened' } );
		openDialog( {
			component: <ImportDesignSystemDialog onClose={ closeDialog } />,
		} );
	};

	const runExport = async () => {
		notifyExportInProgress();

		try {
			const { blob, fileName } = await exportMutation.mutateAsync();
			downloadBlob( blob, fileName );
			notifyExportSuccess();
		} catch {
			notifyExportFailure( runExport );
		}
	};

	const handleExport = () => {
		popupState.close();
		void runExport();
	};

	const triggerLabel = __( 'Design system actions', 'elementor' );

	return (
		<>
			{ isAdmin && (
				<Tooltip title={ triggerLabel } placement="top">
					<span>
						<IconButton
							{ ...triggerProps }
							size="small"
							aria-label={ triggerLabel }
							disabled={ isImporting || isExporting }
						>
							<DotsVerticalIcon fontSize="small" />
						</IconButton>
					</span>
				</Tooltip>
			) }

			<Menu
				{ ...bindMenu( popupState ) }
				MenuListProps={ { dense: true } }
				PaperProps={ { elevation: 6 } }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'right' } }
			>
				<MenuItem onClick={ handleImport } disabled={ isImporting }>
					<ListItemIcon>
						<UploadIcon fontSize="tiny" />
					</ListItemIcon>
					<ListItemText>{ __( 'Import', 'elementor' ) }</ListItemText>
				</MenuItem>
				<MenuItem onClick={ handleExport } disabled={ isExporting }>
					<ListItemIcon>
						<DownloadIcon fontSize="tiny" />
					</ListItemIcon>
					<ListItemText>{ __( 'Export', 'elementor' ) }</ListItemText>
				</MenuItem>
			</Menu>
		</>
	);
};
