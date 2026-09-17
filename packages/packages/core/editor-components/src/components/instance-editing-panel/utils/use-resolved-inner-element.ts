import { useMemo } from 'react';
import { useElement } from '@elementor/editor-editing-panel';
import { type ElementType, getElementSettings, getElementType } from '@elementor/editor-elements';
import { type AnyTransformable, type PropValue } from '@elementor/editor-props';

import { componentInstanceOverridePropTypeUtil } from '../../../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverridesPropValue } from '../../../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { useComponentId, useComponentInstanceOverrides } from '../../../provider/component-instance-context';
import { type OverridableProp } from '../../../types';
import { resolveOverridesChain } from '../../../utils/resolve-overrides-chain';
import { OverrideControlInnerElementNotFoundError } from '../../errors';
import {
	applyOverridesToSettings,
	type ElementSettings,
	type OverridesMapping,
	unwrapOverridableSettings,
} from './resolve-element-settings';

type ResolvedInnerElement = {
	elementId: string;
	elementType: ElementType;
	resolvedOriginValues: ElementSettings;
	resolvedElementSettings: ElementSettings;
};

export function useResolvedInnerElement( overridableProp: OverridableProp ): ResolvedInnerElement {
	const componentInstanceElement = useElement();
	const componentId = useComponentId();
	const overrides = useComponentInstanceOverrides();

	const { elementId: originElementId, widgetType, elType } = overridableProp.originPropFields ?? overridableProp;
	const type = elType === 'widget' ? widgetType : elType;
	const elementType = getElementType( type );

	if ( ! elementType ) {
		throw new Error( `Element type not found for ${ type }` );
	}

	const { elementId, overridesMapping } = useMemo( () => {
		const overridesChainResult = resolveOverridesChain( {
			outerOverridableProp: overridableProp,
			outerInstanceId: componentInstanceElement.element.id,
		} );

		if ( overridesChainResult.isChainBroken ) {
			throw new OverrideControlInnerElementNotFoundError( {
				context: { componentId, elementId: originElementId },
			} );
		}

		return {
			elementId: overridesChainResult.innerElement.id,
			overridesMapping: overridesChainResult.overridesMapping,
		};
	}, [ overridableProp, componentInstanceElement.element.id, componentId, originElementId ] );

	// Not reactive to inner element store changes — intentional.
	// Inner element settings can only change in component edit mode, which unmounts this component.
	const settingsWithInnerOverrides = useMemo( () => {
		const settings = getElementSettings< AnyTransformable >(
			elementId,
			Object.keys( elementType?.propsSchema ?? {} )
		);

		return applyOverridesToSettings( settings, overridesMapping );
	}, [ elementId, elementType?.propsSchema, overridesMapping ] );

	const resolvedElementSettings = useMemo( () => {
		const withAllOverrides = applyOverridesToSettings(
			settingsWithInnerOverrides,
			formatOverridesToApply( overrides )
		);
		return unwrapOverridableSettings( withAllOverrides );
	}, [ settingsWithInnerOverrides, overrides ] );

	return {
		elementId,
		elementType,
		resolvedOriginValues: settingsWithInnerOverrides,
		resolvedElementSettings,
	};
}

function formatOverridesToApply( overrides: ComponentInstanceOverridesPropValue ): OverridesMapping {
	if ( ! overrides ) {
		return {};
	}

	const result: OverridesMapping = {};

	for ( const item of overrides ) {
		const overridable = componentOverridablePropTypeUtil.extract( item );
		let override: PropValue = item;

		if ( overridable ) {
			override = overridable.origin_value;
		}

		const extractedOverride = componentInstanceOverridePropTypeUtil.extract( override );
		if ( ! extractedOverride ) {
			continue;
		}

		result[ extractedOverride.override_key ] = {
			value: extractedOverride.override_value as AnyTransformable | null,
		};
	}

	return result;
}
