import * as React from 'react';
import { CrownFilledIcon, PencilIcon } from '@elementor/icons';
import { Alert, AlertAction, AlertTitle, Box, Stack, Typography } from '@elementor/ui';
import { hasProInstalled } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { useComponentsPermissions } from '../../hooks/use-components-permissions';
import { ComponentInstanceProvider } from '../../provider/component-instance-context';
import { DetachAction } from './detach-action';
import { EmptyState } from './empty-state';
import { InstancePanelBody } from './instance-panel-body';
import { EditComponentAction, InstancePanelHeader } from './instance-panel-header';
import { useInstancePanelData } from './use-instance-panel-data';

const EDIT_UPGRADE_URL = 'https://go.elementor.com/go-pro-components-edit/';

export function InstanceEditingPanel() {
	const { canEdit } = useComponentsPermissions();
	const data = useInstancePanelData();
	const hasPro = hasProInstalled();

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
			{ ! hasPro && <InstanceEditUpgradeAlert /> }
		</Box>
	);
}

function InstanceEditUpgradeAlert() {
	return (
		<Box sx={ { mt: 'auto' } }>
			<Alert
				variant="standard"
				color="promotion"
				icon={ <CrownFilledIcon fontSize="tiny" /> }
				role="status"
				size="small"
				action={
					<AlertAction
						variant="contained"
						color="promotion"
						href={ EDIT_UPGRADE_URL }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Upgrade Now', 'elementor' ) }
					</AlertAction>
				}
				sx={ { m: 2, mt: 1 } }
			>
				<AlertTitle>{ __( 'Edit Component', 'elementor' ) }</AlertTitle>
				<Typography variant="caption">
					{ __( 'Your Pro subscription has expired.', 'elementor' ) }
					<br />
					{ __( 'Reactivate to enable components again.', 'elementor' ) }
				</Typography>
			</Alert>
		</Box>
	);
}
