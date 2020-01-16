/* global jQuery */
import * as Ajax from './';

const getWidgetsConfig = ( action, fullParams ) => {
	return {
		success: false,
	};
};

const mockActions = {
	save_builder: Ajax.saveBuilder,
	get_widgets_config: getWidgetsConfig,
};

export const sendOriginal = elementorCommon.ajax.send;

export const handleSend = ( params ) => {
	if ( params.data && 'elementor_ajax' === params.data.action ) {
		const { actions = {} } = params.data,
			responses = {};

		Object.keys( mockActions ).forEach( ( mockAction ) => {
			Object.values( actions ).forEach( ( action ) => {
				if ( mockAction === action.action ) {
					responses[ mockAction ] = mockActions[ mockAction ]( action, params );
				}
			} );
		} );

		params.success( {
			success: true,
			data: {
				responses,
			},
		} );
	} else {
		params.error( `Unknown action: '${ params.data.action }'` );
	}
};

export const initialize = () => {
	elementorCommon.ajax.send = ( action, options ) => {
		const params = elementorCommon.ajax.prepareSend( action, options );

		if ( params.data && params.data.actions ) {
			params.data.actions = JSON.parse( params.data.actions );
		}

		setTimeout( handleSend.bind( this, params ) );

		return params;
	};
}
