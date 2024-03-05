export const saveDisabledWidgets = async ( widgetsDisabled, elementsRestriction = {} ) => {
	try {
		const bodyData = {
			action: 'elementor_element_manager_save_disabled_elements',
			nonce: eElementManagerConfig.nonce,
			widgets: JSON.stringify( widgetsDisabled ),
		};

		if ( null !== elementsRestriction ) {
			bodyData.elements_restriction = JSON.stringify( elementsRestriction );
		}

		await fetch( eElementManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( bodyData ),
		} );
	} catch ( error ) {
		console.error( error ); // eslint-disable-line no-console
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
		console.error( error ); // eslint-disable-line no-console
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
				action: 'elementor_element_manager_get_widgets_usage',
				nonce: eElementManagerConfig.nonce,
			} ),
		} );

		const data = await response.json();
		if ( data.success ) {
			return data.data;
		}
	} catch ( error ) {
		console.error( error ); // eslint-disable-line no-console
	}
};

export const markNoticeViewed = async ( noticeId ) => {
	try {
		const response = await fetch( eElementManagerConfig.ajaxurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				action: 'elementor_set_admin_notice_viewed',
				notice_id: noticeId,
			} ),
		} );

		const data = await response.json();
		if ( data.success ) {
			return data.data;
		}
	} catch ( error ) {
		console.error( error ); // eslint-disable-line no-console
	}
};
