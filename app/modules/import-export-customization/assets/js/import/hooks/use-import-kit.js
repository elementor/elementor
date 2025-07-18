import { useState, useEffect } from 'react';
import { IMPORT_STATUS, useImportContext } from '../context/import-context';

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
		throw new Error( errorMessage );
	}

	return result;
}

export const IMPORT_PROCESSING_STATUS = {
	PENDING: 'PENDING',
	IN_PROGRESS: 'IN_PROGRESS',
	DONE: 'DONE',
};

export function useImportKit() {
	const [ status, setImportStatus ] = useState( IMPORT_PROCESSING_STATUS.PENDING );
	const [ error, setError ] = useState( null );
	const { data, isProcessing, dispatch } = useImportContext();
	const [ runnersState, setRunnersState ] = useState( {} );

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

				setRunnersState( ( prevState ) => ( {
					...prevState,
					[ runner ]: result.data.imported_data?.[ runner ] || result.data[ runner ],
				} ) );
			} catch ( e ) {
				stopIterations = e;
				setError( e );
			}
		}

		setImportStatus( IMPORT_PROCESSING_STATUS.DONE );
		dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.COMPLETED } );
	};

	async function importKit() {
		try {
			setImportStatus( IMPORT_PROCESSING_STATUS.IN_PROGRESS );

			const importData = {
				id: data.kitUploadParams?.id,
				referrer: data.kitUploadParams?.referrer,
				session: data.uploadedData.session,
				include: data.includes,
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
	}, [ data.includes, isProcessing ] );

	useEffect( () => {
		if ( isProcessing && data.importedData && ! error ) {
			runImportRunners();
		}
	}, [ data.importedData, isProcessing, error ] );

	return {
		status,
		error,
		runnersState,
	};
}
