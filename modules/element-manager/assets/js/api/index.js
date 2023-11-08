export const saveDisabledWidgets = async ( widgetsDisabled ) => {
	try {
		const response = await fetch( eElementManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_element_manager_save_disabled_elements',
				nonce: eElementManagerConfig.nonce,
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
		const response = await fetch( eElementManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_element_manager_get_admin_app_data',
				nonce: eElementManagerConfig.nonce,
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
		const response = await fetch( eElementManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_element_manager_get_usage_widgets',
				nonce: eElementManagerConfig.nonce,
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
