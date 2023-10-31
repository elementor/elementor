export const onConnect = ( data ) => {
	elementorCommon.config.library_connect.is_connected = true;
	elementorCommon.config.library_connect.current_access_level = data.kits_access_level || data.access_level || 0;
	elementorCommon.config.library_connect.current_access_tier = data.access_tier;
};

export const vh = ( value ) => {
	const h = Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );
	return ( value * h ) / 100;
};
