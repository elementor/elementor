import { type LegacyWindow } from '@elementor/editor-canvas';
import {
	reconcileInitialChildren,
	type V1ElementConfig,
	type V1ElementData,
	type V1ElementSettingsProps,
} from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';

import {
	applyOverridesToSettings,
	type ElementSettings,
	type OverridesMapping,
	unwrapOverridableSettings,
} from '../components/instance-editing-panel/utils/resolve-element-settings';

function overridesRecordToMapping( overrides: Record< string, unknown > ): OverridesMapping {
	const mapping: OverridesMapping = {};

	for ( const [ key, value ] of Object.entries( overrides ) ) {
		mapping[ key ] = { value: value as AnyTransformable };
	}

	return mapping;
}

function getElementConfig( element: V1ElementData ): V1ElementConfig | undefined {
	const legacyWindow = window as unknown as LegacyWindow;
	const type = element.elType === 'widget' ? element.widgetType : element.elType;

	if ( ! type ) {
		return undefined;
	}

	return legacyWindow.elementor?.config?.elements?.[ type ] as V1ElementConfig | undefined;
}

function reconcileElementTree( element: V1ElementData, overridesMapping: OverridesMapping ): V1ElementData {
	const elementConfig = getElementConfig( element );
	const withOverrides = applyOverridesToSettings( ( element.settings ?? {} ) as ElementSettings, overridesMapping );
	const effectiveSettings = unwrapOverridableSettings( withOverrides ) as V1ElementSettingsProps;

	const attributes: {
		elements?: V1ElementData[];
		settings?: V1ElementSettingsProps;
	} = {
		elements: element.elements ? [ ...element.elements ] : [],
		settings: effectiveSettings,
	};

	if ( elementConfig?.children_dependencies?.length ) {
		reconcileInitialChildren( {
			elementId: element.id,
			elementConfig,
			attributes,
		} );
	}

	const reconciledChildren = ( attributes.elements ?? [] ).map( ( child ) =>
		reconcileElementTree( child, overridesMapping )
	);

	return {
		...element,
		settings: effectiveSettings,
		elements: reconciledChildren,
	};
}

export function reconcileComponentInstanceElements(
	elements: V1ElementData[],
	overrides: Record< string, unknown > = {}
): V1ElementData[] {
	const overridesMapping = overridesRecordToMapping( overrides );

	return elements.map( ( element ) => reconcileElementTree( element, overridesMapping ) );
}
