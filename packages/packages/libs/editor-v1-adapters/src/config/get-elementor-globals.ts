export const getElementorConfig = () => {
	return window.elementor?.config ?? {};
};

export const getElementorFrontendConfig = () => {
	return window.elementorFrontend?.config ?? {};
};
