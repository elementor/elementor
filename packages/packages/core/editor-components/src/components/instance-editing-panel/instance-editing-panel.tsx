import * as React from 'react';
import { ControlAdornmentsProvider } from '@elementor/editor-controls';
import { getFieldIndicators } from '@elementor/editor-editing-panel';
import { useSelectedElement } from '@elementor/editor-elements';
import { PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { ComponentsIcon, PencilIcon } from '@elementor/icons';
import { IconButton, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponentInstanceSettings } from '../../hooks/use-component-instance-settings';
import { useComponent, useOverridableProps } from '../../store/store';
import { type OverridablePropsGroup } from '../../types';
import { switchToComponent } from '../../utils/switch-to-component';
import { EmptyState } from './empty-state';
import { OverridePropsGroup } from './override-props-group';

export function InstanceEditingPanel() {
	const settings = useComponentInstanceSettings();
	const componentId = settings?.component_id?.value;

	const overrides = settings?.overrides?.value;

	const component = useComponent( componentId ?? null );
	const overridableProps = useOverridableProps( componentId ?? null );

	const componentInstanceId = useSelectedElement()?.element?.id ?? null;

	if ( ! componentId || ! overridableProps || ! component ) {
		return null;
	}

	/* translators: %s: component name. */
	const panelTitle = __( 'Edit %s', 'elementor' ).replace( '%s', component.name );

	const handleEditComponent = () => switchToComponent( componentId, componentInstanceId );

	const groups = overridableProps.groups.order
		.map( ( groupId ) =>
			overridableProps.groups.items[ groupId ] ? overridableProps.groups.items[ groupId ] : null
		)
		.filter( Boolean ) as OverridablePropsGroup[];

	const isEmpty = groups.length === 0 || Object.keys( overridableProps.props ).length === 0;

	return (
		<>
			<PanelHeader sx={ { justifyContent: 'start', px: 2 } }>
				<Stack direction="row" alignContent="space-between" flexGrow={ 1 }>
					<Stack direction="row" alignItems="center" justifyContent="start" gap={ 1 } flexGrow={ 1 }>
						<ComponentsIcon fontSize="small" sx={ { color: 'text.tertiary' } } />
						<PanelHeaderTitle>{ component.name }</PanelHeaderTitle>
					</Stack>
					<Tooltip title={ panelTitle }>
						<IconButton size="tiny" onClick={ handleEditComponent } aria-label={ panelTitle }>
							<PencilIcon fontSize="tiny" />
						</IconButton>
					</Tooltip>
				</Stack>
			</PanelHeader>
			<PanelBody>
				<ControlAdornmentsProvider items={ getFieldIndicators( 'settings' ) }>
					{ isEmpty ? (
						<EmptyState onEditComponent={ handleEditComponent } />
					) : (
						<Stack direction="column" alignItems="stretch">
							{ groups.map( ( group ) => (
								<OverridePropsGroup
									key={ group.id }
									group={ group }
									props={ overridableProps.props }
									overrides={ overrides }
								/>
							) ) }
						</Stack>
					) }
				</ControlAdornmentsProvider>
			</PanelBody>
		</>
	);
}
