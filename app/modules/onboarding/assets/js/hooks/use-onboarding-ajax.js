import { useState, useEffect } from 'react';

export default function useOnboardingAjax() {
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
			}

			const options = {
				type: 'post',
				url: `${ elementorCommon.config.urls.rest }elementor/v1/onboarding/${ config.endpoint }`,
				headers: {
					'X-WP-Nonce': elementorWebCliConfig.nonce,
				},
				cache: false,
				contentType: false,
				processData: false,
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
					setAjaxState( ( prevState ) => ( { ...prevState, status: response?.status, response: response?.payload } ) );
				} )
				.catch( ( error ) => {
					const response = 408 === error.status ? 'timeout' : error.responseJSON?.data;
					setAjaxState( ( prevState ) => ( { ...prevState, status: 'error', response } ) );
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
