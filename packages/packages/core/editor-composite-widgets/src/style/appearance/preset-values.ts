import { isTransformable, type ObjectPropValue, type Props, type PropValue } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';
import { getStylesSchema } from '@elementor/editor-styles';

import { type CompositeWidgetPreset, type CompositeWidgetPresetWrite } from '../../types';

export function isObjectStyleProp( prop: string ): boolean {
	return getStylesSchema()?.[ prop ]?.kind === 'object';
}

export function mergePresetValue( prop: string, current: PropValue | undefined, preset: PropValue ): PropValue {
	const presetObject = preset as ObjectPropValue;

	if ( ! isObjectStyleProp( prop ) || ! isTransformable( current ) || current.$$type !== presetObject.$$type ) {
		return preset;
	}

	return { ...presetObject, value: { ...( current as ObjectPropValue ).value, ...presetObject.value } };
}

export function resolvePresetProps( style: CompositeWidgetPresetWrite[ 'style' ], path: BreakpointId[] ): Props {
	return Object.assign( {}, ...path.map( ( breakpoint ) => style[ breakpoint ] ?? {} ) );
}

export function getPresetPartNames( preset: CompositeWidgetPreset ): string[] {
	return [ ...new Set( preset.options.flatMap( ( option ) => option.set.map( ( { part } ) => part ) ) ) ];
}
