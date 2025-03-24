export const triggerOptIn = async () => {
	return elementorCommon.ajax.addRequest( 'editor_v4_opt_in' );
};

export const triggerOptOut = async () => {
	return elementorCommon.ajax.addRequest( 'editor_v4_opt_out' );
};
