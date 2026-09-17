export const getFontConfigs = () => {
	return window.elementor?.config?.controls?.font?.options ?? {};
};
