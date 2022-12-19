import { useState, useEffect } from 'react';

export default function useAjax() {
	const [ ajax, setAjax ] = useState( null ),
		initialStatusKey = 'initial',
		uploadInitialState = {
			status: initialStatusKey,
			isComplete: false,
			response: null,
		},
		[ ajaxState, setAjaxState ] = useState( uploadInitialState ),
		ajaxActions = {
			reset: () => setAjaxState( initialStatusKey ),
		};

	const runRequest = async ( config ) => {
		return new Promise( ( resolve, reject ) => {
			const formData = new FormData();

			if ( config.data ) {
				for ( const key in config.data ) {
					formData.append( key, config.data[ key ] );
				}

				if ( ! config.data.nonce ) {
					formData.append( '_nonce', elementorCommon.config.ajax.nonce );
				}
			}

			const options = {
				type: 'post',
				url: elementorCommon.config.ajax.url,
				headers: {},
				cache: false,
				contentType: false,
				processData: false,
				...config,
				data: formData,
				success: ( response ) => {
					resolve( response );
				},
				error: ( error ) => {
					reject( error );
				},
			};

			jQuery.ajax( options );
		} );
	};

	useEffect( () => {
		if ( ajax ) {
			runRequest( ajax )
				.then( ( response ) => {
					const status = response.success ? 'success' : 'error';
					setAjaxState( ( prevState ) => ( { ...prevState, status, response: response?.data } ) );
				} )
				.catch( () => {
					setAjaxState( ( prevState ) => ( { ...prevState, status: 'error' } ) );
				} )
				.finally( () => {
					setAjaxState( ( prevState ) => ( { ...prevState, isComplete: true } ) );
				} );
		}
	}, [ ajax ] );

	return {
		ajax,
		setAjax,
		ajaxState,
		ajaxActions,
		runRequest,
	};
}
