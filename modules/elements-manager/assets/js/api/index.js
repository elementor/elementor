export const saveDisabledWidgets = async ( widgetsDisabled ) => {
	try {
		const response = await fetch( eElementsManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_elements_manager_save_disabled_widgets',
				nonce: eElementsManagerConfig.nonce,
				widgets: JSON.stringify( widgetsDisabled ),
			} ),
		} );

		const data = await response.json();

		console.log(data);
	} catch ( error ) {
		console.log( error );
	}
};

export const getAdminAppData = async () => {
	try {
		const response = await fetch( eElementsManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_elements_manager_get_admin_app_data',
				nonce: eElementsManagerConfig.nonce,
			} ),
		} );

		const data = await response.json();
		if ( data.success ) {
			return data.data;
		}
	} catch ( error ) {
		console.log( error );
	}
};

export const getUsageWidgets = async () => {
	try {
		const response = await fetch( eElementsManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_elements_manager_get_usage_widgets',
				nonce: eElementsManagerConfig.nonce,
			} ),
		} );

		const data = await response.json();
		if ( data.success ) {
			return data.data;
		}
	} catch ( error ) {
		console.log( error );
	}
};
