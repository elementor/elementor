import * as React from 'react';
import { PencilIcon } from '@elementor/icons';
import { Box } from '@elementor/ui';
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
import { switchToComponent } from '../../../utils/switch-to-component';

export function ExtendedInstanceEditingPanel() {
	const { canEdit } = useComponentsPermissions();
	const data = useInstancePanelData();

	if ( ! data ) {
		return null;
	}

	const { componentId, component, overrides, overridableProps, groups, isEmpty, componentInstanceId } = data;

	/* translators: %s: component name. */
	const panelTitle = __( 'Edit %s', 'elementor' ).replace( '%s', component.name );

	const handleEditComponent = () => switchToComponent( componentId, componentInstanceId );

	return (
		<Box data-testid="instance-editing-panel">
			<ComponentInstanceProvider
				componentId={ componentId }
				overrides={ overrides }
				overridableProps={ overridableProps }
			>
				<InstancePanelHeader
					componentName={ component.name }
					actions={
						canEdit ? (
							<EditComponentAction
								label={ panelTitle }
								onClick={ handleEditComponent }
								icon={ PencilIcon }
							/>
						) : undefined
					}
				/>
				<InstancePanelBody
					groups={ groups }
					isEmpty={ isEmpty }
					emptyState={ <EmptyState onEditComponent={ canEdit ? handleEditComponent : undefined } /> }
					componentInstanceId={ componentInstanceId }
				/>
			</ComponentInstanceProvider>
		</Box>
	);
}
