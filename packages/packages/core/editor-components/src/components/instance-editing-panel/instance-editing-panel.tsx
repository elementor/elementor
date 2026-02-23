import * as React from 'react';
import { ControlAdornmentsProvider } from '@elementor/editor-controls';
import { getFieldIndicators, useElement } from '@elementor/editor-editing-panel';
import { useElementSetting, useSelectedElement } from '@elementor/editor-elements';
import { PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { EllipsisWithTooltip } from '@elementor/editor-ui';
import { ComponentsIcon, PencilIcon } from '@elementor/icons';
import { Box, Divider, IconButton, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponentsPermissions } from '../../hooks/use-components-permissions';
import { useSanitizeOverridableProps } from '../../hooks/use-sanitize-overridable-props';
import {
	componentInstancePropTypeUtil,
	type ComponentInstancePropValue,
} from '../../prop-types/component-instance-prop-type';
import { ComponentInstanceProvider } from '../../provider/component-instance-context';
import { useComponent } from '../../store/store';
import { type OverridablePropsGroup } from '../../types';
import { switchToComponent } from '../../utils/switch-to-component';
import { EmptyState } from './empty-state';
import { OverridePropsGroup } from './override-props-group';

export function InstanceEditingPanel() {
	const { canEdit } = useComponentsPermissions();

	const settings = useComponentInstanceSettings();

	const componentId = settings?.component_id?.value;

	const overrides = settings?.overrides?.value;

	const component = useComponent( componentId ?? null );

	const componentInstanceId = useSelectedElement()?.element?.id;

	const overridableProps = useSanitizeOverridableProps( componentId ?? null, componentInstanceId );

	if ( ! componentId || ! overridableProps || ! component ) {
		return null;
	}

	/* translators: %s: component name. */
	const panelTitle = __( 'Edit %s', 'elementor' ).replace( '%s', component.name );

	const handleEditComponent = () => switchToComponent( componentId, componentInstanceId );

	const isNonEmptyGroup = ( group: OverridablePropsGroup | null ) => group !== null && group.props.length > 0;

	const groups = overridableProps.groups.order
		.map( ( groupId ) => overridableProps.groups.items[ groupId ] ?? null )
		.filter( isNonEmptyGroup );

	const isEmpty = groups.length === 0 || Object.keys( overridableProps.props ).length === 0;

	return (
		<Box data-testid="instance-editing-panel">
			<ComponentInstanceProvider
				componentId={ componentId }
				overrides={ overrides }
				overridableProps={ overridableProps }
			>
				<PanelHeader sx={ { justifyContent: 'start', px: 2 } }>
					<Stack direction="row" alignItems="center" flexGrow={ 1 } gap={ 1 } maxWidth="100%">
						<ComponentsIcon fontSize="small" sx={ { color: 'text.tertiary' } } />
						<EllipsisWithTooltip title={ component.name } as={ PanelHeaderTitle } sx={ { flexGrow: 1 } } />
						{ canEdit && (
							<Tooltip title={ panelTitle }>
								<IconButton size="tiny" onClick={ handleEditComponent } aria-label={ panelTitle }>
									<PencilIcon fontSize="tiny" />
								</IconButton>
							</Tooltip>
						) }
					</Stack>
				</PanelHeader>
				<PanelBody>
					<ControlAdornmentsProvider items={ getFieldIndicators( 'settings' ) }>
						{ isEmpty ? (
							<EmptyState onEditComponent={ handleEditComponent } />
						) : (
							<Stack direction="column" alignItems="stretch">
								{ groups.map( ( group ) => (
									<React.Fragment key={ group.id + componentInstanceId }>
										<OverridePropsGroup group={ group } />
										<Divider />
									</React.Fragment>
								) ) }
							</Stack>
						) }
					</ControlAdornmentsProvider>
				</PanelBody>
			</ComponentInstanceProvider>
		</Box>
	);
}

function useComponentInstanceSettings() {
	const { element } = useElement();

	const settings = useElementSetting< ComponentInstancePropValue >( element.id, 'component_instance' );

	return componentInstancePropTypeUtil.extract( settings );
}
