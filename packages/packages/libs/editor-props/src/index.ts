import { initLlmDialect } from './llm-dialect/init';
import { validateLlmJson } from './llm-dialect/validate-llm-dialect';
import { jsonSchemaToPropType } from './utils/llm-schema-to-props';
import { propValuesFromLlm } from './utils/prop-values-from-llm';
import { propValuesToLlm } from './utils/prop-values-to-llm';
import {
	configurableKeys,
	enrichWithIntention,
	isPropKeyConfigurable,
	nonConfigurablePropKeys,
	propTypeToJsonSchema,
	propTypeToLlmJsonSchema,
	removeIntention,
} from './utils/props-to-llm-schema';
import { validatePropValue } from './utils/validate-prop-value';

export { type JsonSchema7 } from './utils/prop-json-schema';

// types
export * from './types';
export { type CreateOptions, type PropTypeUtil } from './utils/create-prop-utils';

// prop types
export * from './prop-types';

// utils
export { createArrayPropUtils, createPropUtils, getPropSchemaFromCache } from './utils/create-prop-utils';
export { filterEmptyValues, isEmpty } from './utils/filter-empty-values';
export { isOverridable, rewrapOverridableValue, type OverridableTransformable } from './utils/is-overridable';
export { isTransformable } from './utils/is-transformable';
export { mergeProps } from './utils/merge-props';
export {
	evaluateTerm,
	extractValue,
	type ExtractValueOptions,
	isDependency,
	isDependencyMet,
} from './utils/prop-dependency-utils';
export { parseHtmlChildren, type ParseResult } from './utils/parse-html-children';
export { type PropFromLlmOptions } from './utils/prop-values-from-llm';
export { type PropToLlmOptions } from './utils/prop-values-to-llm';

export { initLlmDialect };

export const Schema = {
	jsonSchemaToPropType,
	propTypeToJsonSchema,
	propTypeToLlmJsonSchema,
	propFromLlm: propValuesFromLlm,
	propToLlm: propValuesToLlm,
	validateLlmJson,
	isPropKeyConfigurable,
	nonConfigurablePropKeys,
	configurableKeys,
	validatePropValue,
	enrichWithIntention,
	removeIntention,
};
