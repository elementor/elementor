import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@reach/router';
import { generateScreenshot } from '../utils/screenshot';
import { EXPORT_STATUS } from '../context/export-context';

const STATUS_PROCESSING = 'processing';
const STATUS_ERROR = 'error';

export const useExportKit = ( { includes, kitInfo, customization, isExporting, dispatch } ) => {
	const [ status, setStatus ] = useState( STATUS_PROCESSING );
	const navigate = useNavigate();

	const exportKit = useCallback( async () => {
		try {
			setStatus( STATUS_PROCESSING );

			setStatus( STATUS_ERROR );
			return;

			// eslint-disable-next-line no-unreachable
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
				throw new Error( errorMessage );
			}

			const isExportLocal = 'file' === kitInfo.source && result.data && result.data.file;
			const isExportToCloud = 'cloud' === kitInfo.source && result.data && result.data.kit;

			if ( isExportLocal ) {
				const exportedData = {
					file: result.data.file, // This is base64 encoded file data
					manifest: result.data.manifest,
				};

				dispatch( { type: 'SET_EXPORTED_DATA', payload: exportedData } );
			} else if ( isExportToCloud ) {
				const exportedData = {
					kit: result.data.kit,
					manifest: result.data.manifest,
				};

				dispatch( { type: 'SET_EXPORTED_DATA', payload: exportedData } );
			} else {
				throw new Error( 'Invalid response format from server' );
			}

			dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.COMPLETED } );
			navigate( '/export-customization/complete' );
		} catch ( error ) {
			setStatus( STATUS_ERROR );
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
		STATUS_ERROR,
	};
};
