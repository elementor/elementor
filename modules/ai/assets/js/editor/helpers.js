export const onConnect = ( data ) => {
	elementorCommon.config.library_connect.is_connected = true;
	elementorCommon.config.library_connect.current_access_level = data.accessLevel;
};
