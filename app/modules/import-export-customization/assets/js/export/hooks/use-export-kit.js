import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@reach/router';
import { generateScreenshot } from '../utils/screenshot';
import { EXPORT_STATUS } from '../context/export-context';
import { ImportExportError } from '../../shared/error/import-export-error';

const STATUS_PROCESSING = 'processing';
const STATUS_PROCESSING_MEDIA = 'processing-media';
const STATUS_ERROR = 'error';

export const useExportKit = ( { includes, kitInfo, customization, isExporting, dispatch } ) => {
	const [ status, setStatus ] = useState( STATUS_PROCESSING );
	const [ error, setError ] = useState( null );
	const navigate = useNavigate();

	const exportKit = useCallback( async () => {
		try {
			setStatus( STATUS_PROCESSING );
			setError( null );

			const exportData = {
				kitInfo: {
					title: kitInfo.title?.trim() || null,
					description: kitInfo.description?.trim() || null,
					source: kitInfo.source,
				},
				include: includes,
				customization,
			};

			const isCloudExport = 'cloud' === kitInfo.source;

			if ( isCloudExport ) {
				const screenshot = await generateScreenshot();
				exportData.screenShotBlob = screenshot;
			}

			const baseUrl = elementorAppConfig[ 'import-export-customization' ].restApiBaseUrl;
			const exportUrl = `${ baseUrl }/export`;

			const response = await fetch( exportUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.wpApiSettings?.nonce || '',
				},
				body: JSON.stringify( exportData ),
			} );

			const result = await response.json();

			if ( ! response.ok ) {
				const errorMessage = result?.data?.message || `HTTP error! with the following code: ${ result?.data?.code }`;
				const errorCode = 408 === response?.status ? 'timeout' : result?.data?.code;
				throw new ImportExportError( errorMessage, errorCode );
			}

			const isExportLocal = 'file' === kitInfo.source && result.data && result.data.file;
			const isExportToCloud = 'cloud' === kitInfo.source && result.data && result.data.kit;

			let exportedData = null;

			if ( isExportLocal ) {
				exportedData = {
					file: result.data.file, // This is base64 encoded file data
					manifest: result.data.manifest,
				};
			} else if ( isExportToCloud ) {
				exportedData = {
					kit: result.data.kit,
					manifest: result.data.manifest,
				};
			} else {
				throw new ImportExportError( 'Invalid response format from server' );
			}

			const mediaUrls = result.data.media_urls;
			if ( mediaUrls && mediaUrls.length > 0 ) {
				setStatus( STATUS_PROCESSING_MEDIA );

				const mediaResponse = await fetch( `${ baseUrl }/process-media`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': window.wpApiSettings?.nonce || '',
					},
					body: JSON.stringify( {
						media_urls: mediaUrls,
						kit: result.data.kit,
					} ),
				} );

				const mediaResult = await mediaResponse.json();

				if ( ! mediaResponse.ok ) {
					const errorMessage = mediaResult?.data?.message || `Media processing error! Code: ${ mediaResult?.data?.code }`;
					throw new ImportExportError( errorMessage, mediaResult?.data?.code );
				}

				exportedData.media = {
					processed: true,
					message: mediaResult?.data?.message || 'Media processed successfully',
				};
			}

			dispatch( { type: 'SET_EXPORTED_DATA', payload: exportedData } );
			dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.COMPLETED } );
			navigate( '/export-customization/complete' );
		} catch ( err ) {
			setStatus( STATUS_ERROR );
			setError( err instanceof ImportExportError ? err : new ImportExportError( err.message ) );
		}
	}, [ includes, kitInfo, customization, dispatch, navigate ] );

	useEffect( () => {
		if ( isExporting ) {
			exportKit();
		}
	}, [ isExporting, exportKit ] );

	return {
		status,
		STATUS_PROCESSING,
		STATUS_PROCESSING_MEDIA,
		STATUS_ERROR,
		error,
		exportKit,
	};
};
