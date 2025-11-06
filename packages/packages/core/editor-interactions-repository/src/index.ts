export * from './types';

export { interactionsRepository } from './interactions-repository';
export {
	createInteractionsProvider,
	type CreateInteractionsProviderOptions,
} from './utils/create-interactions-provider';

export { ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX } from './providers/document-elements-interactions-provider';
export { init } from './init';

