import { type PropDialectAdapter } from '../registry';
import { LLM_DIALECT_SKIP } from '../skip';

export const overridableLlmDialectAdapter: PropDialectAdapter = {
	id: 'overridable',
	matches: ( { propType } ) => propType.kind === 'plain' && propType.key === 'overridable',
	toDialectSchema: () => LLM_DIALECT_SKIP,
};
