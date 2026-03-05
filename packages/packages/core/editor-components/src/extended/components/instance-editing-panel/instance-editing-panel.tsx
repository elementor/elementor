import * as React from 'react';
import { useState } from 'react';
import { notify } from '@elementor/editor-notifications';
import { DetachIcon, PencilIcon } from '@elementor/icons';
import { Box, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { EmptyState } from '../../../components/instance-editing-panel/empty-state';
import { InstancePanelBody } from '../../../components/instance-editing-panel/instance-panel-body';
import {
	EditComponentAction,
	InstancePanelHeader,
} from '../../../components/instance-editing-panel/instance-panel-header';
import { useInstancePanelData } from '../../../components/instance-editing-panel/use-instance-panel-data';
import { useComponentsPermissions } from '../../../hooks/use-components-permissions';
import { ComponentInstanceProvider } from '../../../provider/component-instance-context';
import { type ExtendedWindow } from '../../../types';
import { detachComponentInstance } from '../../../utils/detach-component-instance';
import { switchToComponent } from '../../../utils/switch-to-component';
import { DetachInstanceConfirmationDialog } from '../detach-instance-confirmation-dialog';

export function ExtendedInstanceEditingPanel() {
	const { canEdit } = useComponentsPermissions();
	const data = useInstancePanelData();
	const [ isDetachDialogOpen, setIsDetachDialogOpen ] = useState( false );

	if ( ! data ) {
		return null;
	}

	const { componentId, component, overrides, overridableProps, groups, isEmpty, componentInstanceId } = data;

	/* translators: %s: component name. */
	const panelTitle = __( 'Edit %s', 'elementor' ).replace( '%s', component.name );
	const detachLabel = __( 'Detach from Component', 'elementor' );

	const handleEditComponent = () => switchToComponent( componentId, componentInstanceId );

	const handleDetachClick = () => {
		setIsDetachDialogOpen( true );
	};

	const handleDetachConfirm = async () => {
		setIsDetachDialogOpen( false );

		try {
			await detachComponentInstance( {
				instanceId: componentInstanceId,
				componentId,
				trackingInfo: getDetachTrackingInfo(),
			} );
		} catch {
			notify( {
				type: 'error',
				message: __( 'Failed to detach component instance.', 'elementor' ),
				id: 'detach-component-instance-failed',
			} );
		}
	};

	const handleDetachCancel = () => {
		setIsDetachDialogOpen( false );
	};

	const actions = (
		<Stack direction="row" gap={ 0.5 }>
			<EditComponentAction label={ detachLabel } icon={ DetachIcon } onClick={ handleDetachClick } />
			{ canEdit && (
				<EditComponentAction label={ panelTitle } onClick={ handleEditComponent } icon={ PencilIcon } />
			) }
		</Stack>
	);

	return (
		<Box data-testid="instance-editing-panel">
			<ComponentInstanceProvider
				componentId={ componentId }
				overrides={ overrides }
				overridableProps={ overridableProps }
			>
				<InstancePanelHeader componentName={ component.name } actions={ actions } />
				<InstancePanelBody
					groups={ groups }
					isEmpty={ isEmpty }
					emptyState={ <EmptyState onEditComponent={ canEdit ? handleEditComponent : undefined } /> }
					componentInstanceId={ componentInstanceId }
				/>
			</ComponentInstanceProvider>
			<DetachInstanceConfirmationDialog
				open={ isDetachDialogOpen }
				onClose={ handleDetachCancel }
				onConfirm={ handleDetachConfirm }
			/>
		</Box>
	);
}

function getDetachTrackingInfo() {
	const extendedWindow = window as unknown as ExtendedWindow;
	const config = extendedWindow?.elementorCommon?.eventsManager?.config;

	if ( ! config ) {
		return {
			location: '',
			trigger: '',
		};
	}

	return {
		location: ( config.locations.components as Record< string, string > ).instanceEditingPanel,
		trigger: config.triggers.click,
	};
}
