import * as React from 'react';
import { useUserStylesCapability } from '@elementor/editor-styles-repository';
<<<<<<< HEAD
import { SaveChangesDialog, useDialog } from '@elementor/editor-ui';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
=======
>>>>>>> f4e4f16c00 (Fix: Inconsistent dirty document check between Design System tabs [ED-24099] (#35927))
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { globalClassesStylesProvider } from '../../global-classes-styles-provider';
import { usePrefetchCssClassUsage } from '../../hooks/use-prefetch-css-class-usage';
import { trackGlobalClasses } from '../../utils/tracking';
import { usePanelActions } from './class-manager-panel';
import { FlippedColorSwatchIcon } from './flipped-color-swatch-icon';

const EVENT_TOGGLE_DESIGN_SYSTEM = 'elementor/toggle-design-system';

export const ClassManagerButton = () => {
<<<<<<< HEAD
	const document = useActiveDocument();
	const { open: openPanel } = usePanelActions();
	const { save: saveDocument } = useActiveDocumentActions();
	const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
=======
>>>>>>> f4e4f16c00 (Fix: Inconsistent dirty document check between Design System tabs [ED-24099] (#35927))
	const { prefetchClassesUsage } = usePrefetchCssClassUsage();

	const { userCan } = useUserStylesCapability();

	const isUserAllowedToUpdateClass = userCan( globalClassesStylesProvider.getKey() ).update;

	if ( ! isUserAllowedToUpdateClass ) {
		return null;
	}

<<<<<<< HEAD
	const toggleClassesManagerPanel = () => {
		if ( isExperimentActive( 'e_editor_design_system_panel' ) ) {
			window.dispatchEvent(
				new CustomEvent( 'elementor/toggle-design-system', {
					detail: { tab: 'classes' as const },
				} )
			);
		} else {
			openPanel();
		}
	};
=======
	const handleOpenPanel = () => {
		window.dispatchEvent(
			new CustomEvent( EVENT_TOGGLE_DESIGN_SYSTEM, {
				detail: { tab: 'classes' as const },
			} )
		);
>>>>>>> f4e4f16c00 (Fix: Inconsistent dirty document check between Design System tabs [ED-24099] (#35927))

		trackGlobalClasses( {
			event: 'classManagerOpened',
			source: 'style-panel',
		} );
		prefetchClassesUsage();
	};

	return (
		<Tooltip title={ __( 'Class Manager', 'elementor' ) } placement="top">
			<IconButton size="tiny" onClick={ handleOpenPanel } sx={ { marginInlineEnd: -0.75 } }>
				<FlippedColorSwatchIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
