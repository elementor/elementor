// export * from './components/empty-state';
// export * from './components/interactions-tab';
// export * from './types';
// export * from './utils/get-interactions-config';

export { injectIntoInteractionTriggerSlot, injectIntoInteractionAnimationSlot } from './locations';

export { InteractionsField } from './components-2/interactions-field';

export { interactionsRepository } from './interactions-repository';
export {
	createInteractionsProvider,
	type CreateInteractionsProviderOptions,
} from './utils/create-interactions-provider';

export { ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX } from './providers/document-elements-interactions-provider';
export { init } from './init';
export { registerInteractionsControl } from './interactions-controls-registry';
export { ControlField as InteractionControlField } from './components-2/control-field';
export { Size as InteractionSizeControl } from './components-2/controls/size';
