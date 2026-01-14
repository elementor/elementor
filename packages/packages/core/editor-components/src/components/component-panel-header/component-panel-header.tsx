import * as React from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { getV1DocumentsManager } from '@elementor/editor-documents';
import { ArrowLeftIcon, ComponentsFilledIcon } from '@elementor/icons';
import { __getState as getState } from '@elementor/store';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useNavigateBack } from '../../hooks/use-navigate-back';
import { type ComponentsSlice, SLICE_NAME, useCurrentComponent } from '../../store/store';
import { trackComponentEvent } from '../../utils/tracking';
import { usePanelActions } from '../component-properties-panel/component-properties-panel';
import { ComponentIntroduction } from '../components-tab/component-introduction';
import { ComponentsBadge } from './component-badge';
import { useOverridableProps } from './use-overridable-props';

const MESSAGE_KEY = 'components-properties-introduction';

export const ComponentPanelHeader = () => {
	const { id: currentComponentId, uid: componentUid } = useCurrentComponent() ?? { id: null, uid: null };
	const overridableProps = useOverridableProps( currentComponentId );
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
			component_uid: componentUid,
			properties_count: overridablePropsCount,
		} );
	};

	return (
		<Box>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={ { height: 48, pl: 1.5, pr: 2, py: 1 } }
			>
				<Stack direction="row" alignItems="center">
					<Tooltip title={ __( 'Back', 'elementor' ) }>
						<IconButton size="tiny" onClick={ onBack } aria-label={ __( 'Back', 'elementor' ) }>
							<ArrowLeftIcon fontSize="tiny" />
						</IconButton>
					</Tooltip>
					<Stack direction="row" alignItems="center" gap={ 0.5 }>
						<ComponentsFilledIcon fontSize="tiny" stroke="currentColor" />
						<Typography variant="caption" sx={ { fontWeight: 500 } }>
							{ componentName }
						</Typography>
					</Stack>
				</Stack>
				<ComponentsBadge
					overridablePropsCount={ overridablePropsCount }
					ref={ anchorRef }
					onClick={ handleOpenPropertiesPanel }
				/>
			</Stack>
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
