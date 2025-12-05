import { adjustLlmPropValueSchema } from './utils/adjust-llm-prop-value-schema';
import { jsonSchemaToPropType } from './utils/llm-schema-to-props';
import {
	configurableKeys,
	isPropKeyConfigurable,
	nonConfigurablePropKeys,
	propTypeToJsonSchema,
} from './utils/props-to-llm-schema';

export { type JsonSchema7 } from './utils/prop-json-schema';

// types
export * from './types';
export { type CreateOptions, type PropTypeUtil } from './utils/create-prop-utils';

// prop types
export * from './prop-types';

// utils
export { createArrayPropUtils, createPropUtils, getPropSchemaFromCache } from './utils/create-prop-utils';
export { filterEmptyValues, isEmpty } from './utils/filter-empty-values';
export { isTransformable } from './utils/is-transformable';
export { mergeProps } from './utils/merge-props';
export { evaluateTerm, extractValue, isDependency, isDependencyMet } from './utils/prop-dependency-utils';

// constants
export { getCompatibleTypeKeys, migratePropValue, PROP_TYPE_COMPATIBILITY_MAP } from './utils/prop-type-compatibility';

export const Schema = {
	jsonSchemaToPropType,
	propTypeToJsonSchema,
	adjustLlmPropValueSchema,
	isPropKeyConfigurable,
	nonConfigurablePropKeys,
	configurableKeys,
};
