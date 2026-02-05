import * as React from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { getV1DocumentsManager } from '@elementor/editor-documents';
import { PanelHeader } from '@elementor/editor-panels';
import { EllipsisWithTooltip } from '@elementor/editor-ui';
import { ArrowLeftIcon, ComponentsFilledIcon } from '@elementor/icons';
import { __getState as getState } from '@elementor/store';
import { Box, Divider, IconButton, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useNavigateBack } from '../../hooks/use-navigate-back';
import { useSanitizeOverridableProps } from '../../hooks/use-sanitize-overridable-props';
import { type ComponentsSlice, SLICE_NAME, useCurrentComponent } from '../../store/store';
import { trackComponentEvent } from '../../utils/tracking';
import { usePanelActions } from '../component-properties-panel/component-properties-panel';
import { ComponentIntroduction } from '../components-tab/component-introduction';
import { ComponentsBadge } from './component-badge';

const MESSAGE_KEY = 'components-properties-introduction';

export const ComponentPanelHeader = () => {
	const { id: currentComponentId, uid: componentUid } = useCurrentComponent() ?? { id: null, uid: null };
	const overridableProps = useSanitizeOverridableProps( currentComponentId );
	const onBack = useNavigateBack();
	const componentName = getComponentName();
	const [ isMessageSuppressed, suppressMessage ] = useSuppressedMessage( MESSAGE_KEY );
	const [ shouldShowIntroduction, setShouldShowIntroduction ] = React.useState( ! isMessageSuppressed );

	const { open: openPropertiesPanel } = usePanelActions();

	const overridablePropsCount = overridableProps ? Object.keys( overridableProps.props ).length : 0;
	const anchorRef = React.useRef< HTMLDivElement >( null );

	if ( ! currentComponentId ) {
		return null;
	}

	const handleCloseIntroduction = () => {
		suppressMessage();
		setShouldShowIntroduction( false );
	};

	const handleOpenPropertiesPanel = () => {
		openPropertiesPanel();

		trackComponentEvent( {
			action: 'propertiesPanelOpened',
			source: 'user',
			component_uid: componentUid,
			properties_count: overridablePropsCount,
		} );
	};

	return (
		<Box>
			<PanelHeader sx={ { justifyContent: 'start', px: 2 } }>
				<Tooltip title={ __( 'Back', 'elementor' ) }>
					<IconButton size="tiny" onClick={ onBack } aria-label={ __( 'Back', 'elementor' ) }>
						<ArrowLeftIcon fontSize="tiny" />
					</IconButton>
				</Tooltip>
				<ComponentsFilledIcon fontSize="tiny" stroke="currentColor" />
				<EllipsisWithTooltip
					title={ componentName }
					as={ Typography }
					variant="caption"
					sx={ { fontWeight: 500, flexGrow: 1 } }
				/>
				<ComponentsBadge
					overridablePropsCount={ overridablePropsCount }
					ref={ anchorRef }
					onClick={ handleOpenPropertiesPanel }
				/>
			</PanelHeader>
			<Divider />
			<ComponentIntroduction
				anchorRef={ anchorRef }
				shouldShowIntroduction={ shouldShowIntroduction }
				onClose={ handleCloseIntroduction }
			/>
		</Box>
	);
};

function getComponentName(): string {
	const state = getState() as ComponentsSlice;
	const path = state[ SLICE_NAME ].path;
	const { instanceTitle } = path.at( -1 ) ?? {};

	if ( instanceTitle ) {
		return instanceTitle;
	}

	const documentsManager = getV1DocumentsManager();
	const currentDocument = documentsManager.getCurrent();

	return currentDocument?.container?.settings?.get( 'post_title' ) ?? '';
}
