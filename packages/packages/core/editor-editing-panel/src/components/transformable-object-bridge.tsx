import * as React from 'react';
import { PropProvider, useBoundProp } from '@elementor/editor-controls';
import {
	getPropSchemaFromCache,
	isDependencyMet,
	isTransformable,
	type ObjectPropValue,
	type Props,
	type PropType,
	type PropTypeUtil,
	type PropValue,
} from '@elementor/editor-props';

import { getObjectSettingsWithDefaults, resolveObjectPropType } from '../utils/prop-dependency-utils';

type TransformableObjectBridgeProps = React.PropsWithChildren;

export function TransformableObjectBridge( { children }: TransformableObjectBridgeProps ) {
	const { propType, value, setValue, placeholder, baseValue } = useBoundProp();
	const objectPropType = resolveObjectPropType( propType, value as PropValue );

	if ( ! objectPropType ) {
		return null;
	}

	const objectKey = objectPropType.key;
	const propTypeUtil = getPropSchemaFromCache( objectKey );
	const innerValue = extractTransformableObjectInner( objectKey, value as PropValue, propTypeUtil );
	const innerPlaceholder = extractTransformableObjectInner( objectKey, placeholder as PropValue, propTypeUtil );
	const innerBaseValue = extractTransformableObjectInner( objectKey, baseValue as PropValue, propTypeUtil );
	const objectShape = objectPropType.shape ?? {};
	const settingsWithDefaults = getObjectSettingsWithDefaults( objectShape, innerValue );
	const scopedIsDisabled = ( innerPropType: PropType ) =>
		! isDependencyMet( innerPropType?.dependencies, settingsWithDefaults ).isMet;

	const setInnerValue = (
		next: Props,
		options?: Parameters< typeof setValue >[ 1 ],
		meta?: Parameters< typeof setValue >[ 2 ]
	) => {
		setValue(
			createTransformableObjectEnvelope( objectKey, next, value as PropValue, propTypeUtil ),
			options,
			meta
		);
	};

	return (
		<PropProvider
			propType={ objectPropType }
			value={ innerValue }
			setValue={ setInnerValue }
			isDisabled={ scopedIsDisabled }
			placeholder={ innerPlaceholder }
			baseValue={ innerBaseValue }
		>
			{ children }
		</PropProvider>
	);
}

function extractTransformableObjectInner(
	objectKey: string,
	value: PropValue | null | undefined,
	propTypeUtil?: PropTypeUtil< string, PropValue >
): Props {
	const fromUtil = propTypeUtil?.extract( value );

	if ( fromUtil ) {
		return fromUtil as Props;
	}

	if (
		isTransformable( value ) &&
		value.$$type === objectKey &&
		value.value &&
		typeof value.value === 'object' &&
		! Array.isArray( value.value )
	) {
		return value.value as Props;
	}

	return {};
}

function createTransformableObjectEnvelope(
	objectKey: string,
	innerBag: Props,
	base: PropValue | null | undefined,
	propTypeUtil?: PropTypeUtil< string, PropValue >
): PropValue {
	if ( propTypeUtil ) {
		return propTypeUtil.create( innerBag as PropValue, { base: base ?? undefined } );
	}

	return {
		$$type: objectKey,
		value: innerBag as ObjectPropValue[ 'value' ],
	};
}
