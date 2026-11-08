export const isAngiePluginActive = (): boolean => {
	return Boolean( window.elementor?.config?.widgetCreation?.isAngiePluginActive );
};
