import * as React from 'react';
import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { useUserStylesCapability } from '@elementor/editor-styles-repository';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { globalClassesStylesProvider } from '../../global-classes-styles-provider';
import { usePrefetchCssClassUsage } from '../../hooks/use-prefetch-css-class-usage';
import { usePanelActions } from './class-manager-panel';
import { FlippedColorSwatchIcon } from './flipped-color-swatch-icon';
import { SaveChangesDialog, useDialog } from './save-changes-dialog';

export const ClassManagerButton = () => {
	const document = useActiveDocument();
	const { open: openPanel } = usePanelActions();
	const { save: saveDocument } = useActiveDocumentActions();
	const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
	const { prefetchClassesUsage } = usePrefetchCssClassUsage();

	const { userCan } = useUserStylesCapability();

	const isUserAllowedToUpdateClass = userCan( globalClassesStylesProvider.getKey() ).update;

	if ( ! isUserAllowedToUpdateClass ) {
		return null;
	}

	const handleOpenPanel = () => {
		if ( document?.isDirty ) {
			openSaveChangesDialog();
			return;
		}

		openPanel();
		prefetchClassesUsage();
	};

	return (
		<>
			<Tooltip title={ __( 'Class Manager', 'elementor' ) } placement="top">
				<IconButton size="tiny" onClick={ handleOpenPanel } sx={ { marginInlineEnd: -0.75 } }>
					<FlippedColorSwatchIcon fontSize="tiny" />
				</IconButton>
			</Tooltip>
			{ isSaveChangesDialogOpen && (
				<SaveChangesDialog>
					<SaveChangesDialog.Title>{ __( 'You have unsaved changes', 'elementor' ) }</SaveChangesDialog.Title>
					<SaveChangesDialog.Content>
						<SaveChangesDialog.ContentText sx={ { mb: 2 } }>
							{ __(
								"To open the Class Manager, save your page first. You can't continue without saving.",
								'elementor'
							) }
						</SaveChangesDialog.ContentText>
					</SaveChangesDialog.Content>
					<SaveChangesDialog.Actions
						actions={ {
							cancel: {
								label: __( 'Stay here', 'elementor' ),
								action: closeSaveChangesDialog,
							},
							confirm: {
								label: __( 'Save & Continue', 'elementor' ),
								action: async () => {
									await saveDocument();
									closeSaveChangesDialog();
									openPanel();
									prefetchClassesUsage();
								},
							},
						} }
					/>
				</SaveChangesDialog>
			) }
		</>
	);
};
