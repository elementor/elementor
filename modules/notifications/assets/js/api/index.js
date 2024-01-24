const request = ( endpoint, data = {} ) => {
	return new Promise( ( resolve, reject ) => {
		elementorCommon.ajax.addRequest(
			endpoint,
			{
				success: resolve,
				error: reject,
				data,
			},
		);
	} );
};

export const getNotifications = () => request( 'notifications_get' );
