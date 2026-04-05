export {
	isGutenbergEditor,
	isElementorEditor,
	isElementorAIActive,
	hasGutenbergUI,
	ensureElementorFrontend,
	isElementorEditorReady,
	waitForElementorEditor,
	waitForElementor,
	whenElementorReady,
} from './editor-detection';

export {
	injectElementCSS,
	removeElementCSS,
	updateElementSettings,
	getElementSettings,
	getGutenbergBlockEditorApis,
	validateAndGetGutenbergBlock,
	updateGutenbergBlockAttributes,
	extractElementImageData,
	isSelectAllCheckbox,
} from './elements';

export { callWpApi, extractJSONFromResponse } from './rest-client';
export { initNonceRefresh, refreshNonce, isNonceError } from './nonce-refresh';
export { requireConfirmationMessage } from './validation-utils';

export type {
	ElementorChannels,
	ElementorCommandsInstance,
	ElementorCommonInstance,
	ElementorContainer,
	ElementorDocument,
	ElementorFrontendInstance,
	ElementorInstance,
	JQuery,
	WpApiSettings,
	WpDataInstance,
} from './types';

export {
	get$e,
	getAjaxUrl,
	getElementor,
	getElementorAiConfig,
	getElementorCommon,
	getElementorFrontend,
	getJQuery,
	getWp,
	getWpApiSettings,
} from './utils';
