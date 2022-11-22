export const useDocumentConfig = () => {
	if (window.elementor?.documents?.getCurrent()) {
		return window.elementor.documents.getCurrent().config;
	}

	return window.ElementorConfig.initial_document;
}
