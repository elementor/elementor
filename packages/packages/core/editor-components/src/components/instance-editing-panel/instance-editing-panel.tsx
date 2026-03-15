import * as React from 'react';
import { PencilIcon } from '@elementor/icons';
import { Box, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponentsPermissions } from '../../hooks/use-components-permissions';
import { ComponentInstanceProvider } from '../../provider/component-instance-context';
import { isProComponentsSupported, isProOutdatedForComponents } from '../../utils/is-pro-components-supported';
import { ComponentsUpdateAlert } from '../components-update-alert';
import { ComponentsUpgradeAlert } from '../components-upgrade-alert';
import { DetachAction } from './detach-action';
import { EmptyState } from './empty-state';
import { InstancePanelBody } from './instance-panel-body';
import { EditComponentAction, InstancePanelHeader } from './instance-panel-header';
import { useInstancePanelData } from './use-instance-panel-data';

const EDIT_UPGRADE_URL = 'https://go.elementor.com/go-pro-components-edit/';

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
		<Box data-testid="instance-editing-panel" sx={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
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
			{ ! isProComponentsSupported() &&
				( isProOutdatedForComponents() ? (
					<ComponentsUpdateAlert
						title={ __( 'Edit Component', 'elementor' ) }
						description={ __(
							'To edit components, update Elementor Pro to the latest version.',
							'elementor'
						) }
					/>
				) : (
					<ComponentsUpgradeAlert
						title={ __( 'Edit components', 'elementor' ) }
						description={ __( 'Editing components requires an active Pro subscription.', 'elementor' ) }
						upgradeUrl={ EDIT_UPGRADE_URL }
					/>
				) ) }
		</Box>
	);
}
