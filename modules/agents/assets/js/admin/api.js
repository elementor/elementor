export const activateAgentsReady = () => {
	return elementorCommon.ajax.addRequest( 'agents_ready_opt_in' );
};
