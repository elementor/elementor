import { DocumentConfig } from '../types';

declare const ElementorConfig: {
	initial_document: DocumentConfig,
};

export declare const elementor: {
	documents: {
		getCurrent: () => {
			config: DocumentConfig,
		}
	}
};

/**
 * Try to get the current document config, if elementor is not available, use raw Elementor config
 */
export const useDocumentConfig = () => {
	if ( elementor?.documents?.getCurrent() ) {
		return elementor.documents.getCurrent().config;
	}

	return ElementorConfig.initial_document;
};
