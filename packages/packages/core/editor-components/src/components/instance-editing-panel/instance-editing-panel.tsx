import * as React from 'react';
import { PencilIcon } from '@elementor/icons';
import { Box, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponentsPermissions } from '../../hooks/use-components-permissions';
import { ComponentInstanceProvider } from '../../provider/component-instance-context';
import { DetachAction } from './detach-action';
import { EmptyState } from './empty-state';
import { InstancePanelBody } from './instance-panel-body';
import { EditComponentAction, InstancePanelHeader } from './instance-panel-header';
import { useInstancePanelData } from './use-instance-panel-data';

export function InstanceEditingPanel() {
	const { canEdit } = useComponentsPermissions();
	const data = useInstancePanelData();

	if ( ! data ) {
		return null;
	}

	const { componentId, component, overrides, overridableProps, groups, isEmpty, componentInstanceId } = data;

	/* translators: %s: component name. */
	const panelTitle = __( 'Edit %s', 'elementor' ).replace( '%s', component.name );

	const actions = (
		<Stack direction="row" gap={ 0.5 }>
			<DetachAction componentInstanceId={ componentInstanceId } componentId={ componentId } />
			{ canEdit && <EditComponentAction disabled label={ panelTitle } icon={ PencilIcon } /> }
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
					emptyState={ <EmptyState /> }
					componentInstanceId={ componentInstanceId }
				/>
			</ComponentInstanceProvider>
		</Box>
	);
}
