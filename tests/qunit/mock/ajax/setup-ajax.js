/* global jQuery */
import * as Ajax from './index';

const fakeActionFailed = ( action, fullParams ) => {
	return {
		success: false,
	};
};

const mockActions = {
	save_builder: Ajax.saveBuilder,
	discard_changes: Ajax.discardChanges,

	get_widgets_config: fakeActionFailed,
	get_revisions: fakeActionFailed,
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

		if ( Object.entries( responses ).length === Object.entries( params.data.actions ).length ) {
			params.success( {
				success: true,
				data: {
					responses,
				},
			} );
		} else {
			params.error( `One of the mock actions is missing, please check 'setup-ajax.js'` );
		}
	} else {
		params.error( `Unknown action: '${ params.data.action }'` );
	}
};

export const mock = () => {
	elementorCommon.ajax.send = ( action, options ) => {
		const params = elementorCommon.ajax.prepareSend( action, options );

		if ( params.data && params.data.actions ) {
			params.data.actions = JSON.parse( params.data.actions );
		}

		setTimeout( handleSend.bind( this, params ) );

		return params;
	};
};

export const silence = () => {
	elementorCommon.ajax.send = () => {};
};

export const free = () => {
	elementorCommon.ajax.send = sendOriginal;
};
