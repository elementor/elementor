export const onConnect = ( data ) => {
	elementorCommon.config.library_connect.is_connected = true;
	elementorCommon.config.library_connect.current_access_level = data.accessLevel;
};

export const vh = ( value ) => {
	const h = Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );
	return ( value * h ) / 100;
};
