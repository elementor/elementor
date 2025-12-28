import { getContainer, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { generateUniqueId } from '@elementor/utils';

import { COMPONENT_WIDGET_TYPE } from '../create-component-type';
import { componentInstanceOverridesPropTypeUtil } from '../prop-types/component-instance-overrides-prop-type';
import {
	componentInstancePropTypeUtil,
	type ComponentInstancePropValue,
} from '../prop-types/component-instance-prop-type';
import { type ComponentOverride } from '../types';

export function initRegenerateOverrideKeys() {
	registerDataHook( 'after', 'document/elements/duplicate', ( _args, result: V1Element | V1Element[] ) => {
		regenerateOverrideKeysForContainers( result );
	} );

	registerDataHook( 'after', 'document/elements/paste', ( _args, result: V1Element | V1Element[] ) => {
		regenerateOverrideKeysForContainers( result );
	} );

	registerDataHook( 'after', 'document/elements/import', ( _args, result: V1Element | V1Element[] ) => {
		regenerateOverrideKeysForContainers( result );
	} );
}

export function regenerateOverrideKeysForContainers( result: V1Element | V1Element[] ) {
	const containers = Array.isArray( result ) ? result : [ result ];

	containers.forEach( ( container ) => {
		regenerateOverrideKeysRecursive( container.id );
	} );
}

function regenerateOverrideKeysRecursive( elementId: string ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	getAllElements( container ).forEach( ( element: V1Element ) => {
		regenerateOverrideKeys( element );
	} );
}

function getAllElements( container: V1Element ): V1Element[] {
	const children = ( container.children ?? [] ).flatMap( ( child ) => getAllElements( child as V1Element ) ) ?? [];
	return [ container, ...children ];
}

function isComponentInstance( model: V1Element[ 'model' ] ): boolean {
	return model.get( 'widgetType' ) === COMPONENT_WIDGET_TYPE;
}

function regenerateOverrideKeys( element: V1Element ) {
	if ( ! isComponentInstance( element.model ) ) {
		return;
	}

	const settings = element.settings?.toJSON() ?? {};

	if ( ! hasOverrides( settings ) ) {
		return;
	}

	const componentInstance = settings.component_instance;
	const overrides = componentInstance.value.overrides;

	const newOverrides = overrides.value.map( ( override: ComponentOverride ) => {
		if ( override.$$type !== 'override' ) {
			return override;
		}

		return {
			...override,
			value: {
				...override.value,
				override_key: generateUniqueId( 'prop' ),
			},
		};
	} );

	const newComponentInstance = {
		...componentInstance,
		value: {
			...componentInstance.value,
			overrides: {
				...overrides,
				value: newOverrides,
			},
		},
	};

	updateElementSettings( {
		id: element.id,
		props: { component_instance: newComponentInstance },
		withHistory: false,
	} );
}

function hasOverrides( settings: Record< string, unknown > ): settings is {
	component_instance: NonNullable< ComponentInstancePropValue > & {
		value: { overrides: { $$type: string; value: ComponentOverride[] } };
	};
} {
	if ( ! componentInstancePropTypeUtil.isValid( settings?.component_instance ) ) {
		return false;
	}

	const componentInstance = componentInstancePropTypeUtil.extract( settings?.component_instance );

	const overrides = componentInstance?.overrides;

	if ( ! componentInstanceOverridesPropTypeUtil.isValid( overrides ) ) {
		return false;
	}

	const overridesValue = ( overrides as { value?: unknown[] } ).value;

	return Array.isArray( overridesValue ) && overridesValue.length > 0;
}
