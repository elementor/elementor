import { type ObjectPropType, type PropType, type PropValue, type TransformablePropValue } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';
import { LLMDialectAdapter } from './llm-prop-schema';
import { canonicalizeSizePropValue } from './size-canonical-shape';

const SIZE_PROP_TYPE_KEYS = new Set( [ 'size', 'grid-track-size' ] );
const SIZE_INNER_REQUIRED = [ 'unit', 'size' ] as const;

const isSizePropTypeDefinition = ( propType: PropType ): boolean =>
	propType.kind === 'object' && 'key' in propType && SIZE_PROP_TYPE_KEYS.has( propType.key );

const extractUnitEnum = ( schema: JsonSchema7, propType: PropType ): string[] | undefined => {
	const fromSettings = propType.settings?.available_units;
	if ( Array.isArray( fromSettings ) && fromSettings.length > 0 ) {
		return fromSettings as string[];
	}

	const fromNested = schema.properties?.value?.properties?.unit?.properties?.value?.enum;
	if ( Array.isArray( fromNested ) && fromNested.length > 0 ) {
		return fromNested as string[];
	}

	const shapeUnit = ( propType as ObjectPropType ).shape?.unit;
	const fromShape = shapeUnit?.settings?.enum;
	if ( Array.isArray( fromShape ) && fromShape.length > 0 ) {
		return fromShape as string[];
	}

	return undefined;
};

const createFlatSizeInnerSchema = ( unitEnum?: string[] ): JsonSchema7 => {
	const unitSchema: JsonSchema7 = { type: 'string' };

	if ( unitEnum ) {
		unitSchema.enum = unitEnum;
	}

	return {
		type: 'object',
		properties: {
			unit: unitSchema,
			size: {
				oneOf: [ { type: 'number' }, { type: 'string' } ],
			},
		},
		required: [ ...SIZE_INNER_REQUIRED ],
		additionalProperties: false,
	};
};

const flattenSizeLlmSchema = ( schema: JsonSchema7, propType: PropType ): JsonSchema7 => {
	const result = structuredClone( schema );

	if ( ! result.properties?.value ) {
		return result;
	}

	result.properties.value = createFlatSizeInnerSchema( extractUnitEnum( schema, propType ) );

	return result;
};

export function registerSizeLLMDialectAdapter() {
	LLMDialectAdapter.registerSchemaDialect( {
		id: 'size',
		matches: isSizePropTypeDefinition,
		toDialectSchema: ( schema, propType ) => flattenSizeLlmSchema( schema, propType ),
	} );

	LLMDialectAdapter.register( 'size', {
		toPropValue: ( propValue ) =>
			canonicalizeSizePropValue( propValue as PropValue ) as TransformablePropValue< string, unknown >,
		toDialectValue: ( propValue ) =>
			canonicalizeSizePropValue( propValue as PropValue ) as TransformablePropValue< string, unknown >,
	} );
}
