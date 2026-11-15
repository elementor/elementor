export const onConnect = ( data ) => {
	elementorCommon.config.library_connect.is_connected = true;
	elementorCommon.config.library_connect.current_access_level = data.kits_access_level || data.access_level || 0;
	elementorCommon.config.library_connect.current_access_tier = data.access_tier;
	elementorCommon.config.library_connect.plan_type = data.plan_type;
};

export const getUiConfig = () => {
	const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
	const isRTL = elementorCommon.config.isRTL;

	return {
		colorScheme,
		isRTL,
	};
};