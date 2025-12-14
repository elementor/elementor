import * as React from 'react';
import { useElement } from '@elementor/editor-editing-panel';
import { useElementSetting, useSelectedElement } from '@elementor/editor-elements';
import { PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { type NumberPropValue } from '@elementor/editor-props';
import { ComponentsIcon, PencilIcon } from '@elementor/icons';
import { __getState as getState } from '@elementor/store';
import { IconButton, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { selectComponent, selectOverridableProps } from '../../store/store';
import { type OverridablePropsGroup } from '../../types';
import { switchToComponent } from '../../utils/switch-to-component';
import { EmptyState } from './empty-state';
import { OverridePropsGroup } from './override-props-group';

export function InstanceEditPanel() {
	const { element } = useElement();
	const settings = useElementSetting( element.id, 'component_instance' );
	const componentId = ( componentInstancePropTypeUtil.extract( settings )?.component_id as NumberPropValue ).value;

	const component = componentId ? selectComponent( getState(), componentId ) : null;
	const overridableProps = componentId ? selectOverridableProps( getState(), componentId ) : null;

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

	return (
		<>
			<PanelHeader sx={ { justifyContent: 'start' } }>
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
				{ groups.length === 0 ? (
					<EmptyState onEditComponent={ handleEditComponent } />
				) : (
					<Stack direction="column" alignItems="stretch">
						{ groups.map( ( group ) => (
							<OverridePropsGroup key={ group.id } group={ group } props={ overridableProps.props } />
						) ) }
					</Stack>
				) }
			</PanelBody>
		</>
	);
}
