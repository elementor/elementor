import { useState, useEffect } from 'react';
import { IMPORT_STATUS } from '../context/import-context';
import { ImportExportError } from '../../shared/error/import-export-error';

async function request( {
	data,
	path,
	method = 'POST',
} ) {
	const baseUrl = elementorAppConfig[ 'import-export-customization' ].restApiBaseUrl;
	const requestUrl = `${ baseUrl }/${ path }`;
	const response = await fetch( requestUrl, {
		method,
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': window.wpApiSettings?.nonce || '',
		},
		body: JSON.stringify( data ),
	} );

	const result = await response.json();
	if ( ! response.ok ) {
		const errorMessage = result?.data?.message || `HTTP error! with the following code: ${ result?.data?.code }`;
		const errorCode = 408 === response?.status ? 'timeout' : result?.data?.code;
		throw new ImportExportError( errorMessage, errorCode );
	}

	return result;
}

export const IMPORT_PROCESSING_STATUS = {
	PENDING: 'PENDING',
	IN_PROGRESS: 'IN_PROGRESS',
	DONE: 'DONE',
};

export function useImportKit( { data, includes, customization, isProcessing, dispatch } ) {
	const [ status, setImportStatus ] = useState( IMPORT_PROCESSING_STATUS.PENDING );
	const [ error, setError ] = useState( null );
	const [ startTime, setStartTime ] = useState( null );

	const runImportRunners = async () => {
		setImportStatus( IMPORT_PROCESSING_STATUS.IN_PROGRESS );
		const session = data.importedData.session;
		const runners = data.importedData.runners;
		let stopIterations = null;

		for ( const runner of runners ) {
			try {
				if ( stopIterations ) {
					break;
				}
				const result = await request( {
					data: {
						session,
						runner,
					},
					path: 'import-runner',
				} );

				const runnerKey = 'elementor-content' === runner ? 'content' : runner;

				dispatch( { type: 'SET_RUNNERS_STATE', payload: { [ runnerKey ]: result.data.imported_data?.[ runnerKey ] || result.data[ runnerKey ] } } );
			} catch ( e ) {
				stopIterations = e;
				setError( e );
			}
		}

		if ( startTime ) {
			const endTime = Date.now();
			const millisecondsToSeconds = 1000;
			const importDuration = ( endTime - startTime ) / millisecondsToSeconds;
			dispatch( { type: 'SET_DURATION', payload: Number( importDuration.toFixed( 2 ) ) } );
		}

		setImportStatus( IMPORT_PROCESSING_STATUS.DONE );
		dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.COMPLETED } );
	};

	async function importKit() {
		try {
			setError( null );
			setStartTime( Date.now() );
			setImportStatus( IMPORT_PROCESSING_STATUS.IN_PROGRESS );

			const importData = {
				id: data.kitUploadParams?.id,
				referrer: data.kitUploadParams?.referrer,
				session: data?.uploadedData?.session,
				include: includes,
				customization,
			};

			const result = await request( {
				data: importData,
				path: 'import',
			} );

			dispatch( { type: 'SET_IMPORTED_DATA', payload: result.data } );
		} catch ( e ) {
			setError( e );
			setImportStatus( IMPORT_PROCESSING_STATUS.DONE );
		}
	}

	useEffect( () => {
		if ( isProcessing && data.includes.length ) {
			importKit();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data.includes, isProcessing ] );

	useEffect( () => {
		if ( isProcessing && data.importedData && ! error ) {
			runImportRunners();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data.importedData, isProcessing, error ] );

	return {
		status,
		error,
		importKit,
	};
}
