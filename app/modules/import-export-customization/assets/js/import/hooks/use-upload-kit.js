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

			const formData = new FormData();
			formData.append( 'e_import_file', data.file );

			const response = await fetch( uploadUrl, {
				method: 'POST',
				headers: {
					'X-WP-Nonce': window.wpApiSettings?.nonce || '',
				},
				body: formData,
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
		console.log('!_USE_EFFECT_!', data, isUploading);
		if ( isUploading && data.file ) {
			uploadKit();
		}
	}, [ isUploading, data.file ] );

	return {
		uploading,
		error,
	};
}
