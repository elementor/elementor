import * as React from 'react';
import { PencilIcon } from '@elementor/icons';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ComponentInstanceProvider } from '../../provider/component-instance-context';
import { EmptyState } from './empty-state';
import { InstancePanelBody } from './instance-panel-body';
import { EditComponentAction, InstancePanelHeader } from './instance-panel-header';
import { useInstancePanelData } from './use-instance-panel-data';

export function InstanceEditingPanel() {
	const data = useInstancePanelData();

	if ( ! data ) {
		return null;
	}

	const { componentId, component, overrides, overridableProps, groups, isEmpty, componentInstanceId } = data;

	/* translators: %s: component name. */
	const panelTitle = __( 'Edit %s', 'elementor' ).replace( '%s', component.name );

	return (
		<Box data-testid="instance-editing-panel">
			<ComponentInstanceProvider
				componentId={ componentId }
				overrides={ overrides }
				overridableProps={ overridableProps }
			>
				<InstancePanelHeader
					componentName={ component.name }
					actions={ <EditComponentAction disabled label={ panelTitle } icon={ PencilIcon } /> }
				/>
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
