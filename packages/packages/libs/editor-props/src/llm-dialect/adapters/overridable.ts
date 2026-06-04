import { LLM_DIALECT_SKIP, type PropDialectAdapter } from '../registry';

export const overridableLlmDialectAdapter: PropDialectAdapter = {
	id: 'overridable',
	matches: ( { propType } ) => propType.kind === 'plain' && propType.key === 'overridable',
	toDialectSchema: () => LLM_DIALECT_SKIP,
};
