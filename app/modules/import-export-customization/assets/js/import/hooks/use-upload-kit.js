import { useEffect, useState } from 'react';
import { useImportContext } from '../context/import-context';

export function useUploadKit() {
	const { data, isUploading, dispatch } = useImportContext();
	const [ uploading, setUploading ] = useState( false );
	const [ error, setError ] = useState( null );
	async function uploadKit() {
		try {
			setUploading( true );
			const baseUrl = elementorAppConfig[ 'import-export-customization' ].restApiBaseUrl;
			const uploadUrl = `${ baseUrl }/upload`;

			let uploadData = null;

			if ( data.file ) {
				uploadData = new FormData();
				uploadData.append( 'e_import_file', data.file );
			}

			if ( data.kitUploadParams ) {
				const { id, source, fileUrl } = data.kitUploadParams;

				uploadData = JSON.stringify( {
					referrer: source,
					source,
					kit_id: id,
					file_url: fileUrl,
				} );
			}

			const response = await fetch( uploadUrl, {
				method: 'POST',
				headers: {
					'X-WP-Nonce': window.wpApiSettings?.nonce || '',
					...( 'string' === typeof uploadData ? { 'Content-Type': 'application/json' } : null ),
				},
				body: uploadData,
			} );

			const result = await response.json();

			if ( ! response.ok ) {
				const errorMessage = result?.data?.message || `HTTP error! with the following code: ${ result?.data?.code }`;
				throw new Error( errorMessage );
			}

			dispatch( { type: 'SET_UPLOADED_DATA', payload: result.data } );
		} catch ( e ) {
			setError( e );
		} finally {
			setUploading( false );
		}
	}

	useEffect( () => {
		if ( isUploading && ( data.file || data.kitUploadParams ) ) {
			uploadKit();
		} else {
			setError( null );
		}
	}, [ isUploading, data.file, data.kitUploadParams ] );

	return {
		uploading,
		error,
	};
}
