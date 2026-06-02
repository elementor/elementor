export const LLM_DIALECT_SKIP = Symbol( 'llm-dialect-skip' );

export type LlmDialectSkip = typeof LLM_DIALECT_SKIP;

export const isLlmDialectSkip = ( value: unknown ): value is LlmDialectSkip => value === LLM_DIALECT_SKIP;
