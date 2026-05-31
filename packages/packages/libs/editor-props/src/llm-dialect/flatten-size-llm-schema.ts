import { type ObjectPropType, type PropType } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';

const SIZE_INNER_REQUIRED = [ 'unit', 'size' ] as const;

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

export const flattenSizeLlmSchema = ( schema: JsonSchema7, propType: PropType ): JsonSchema7 => {
	const result = structuredClone( schema );

	if ( ! result.properties?.value ) {
		return result;
	}

	result.properties.value = createFlatSizeInnerSchema( extractUnitEnum( schema, propType ) );

	return result;
};
