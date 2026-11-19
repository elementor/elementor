export const canCreateWidget = (): boolean => {
	return Boolean( window.elementor?.config?.widgetCreation?.canCreateWidget );
};
