import { useState, useEffect, useCallback } from 'react';
import { generateScreenshot } from '../utils/screenshot';

const STATUS_PROCESSING = 'processing';
const STATUS_ERROR = 'error';

export const useExportKit = ( { includes, kitInfo, plugins, isExportProcessStarted, dispatch } ) => {
	const [ status, setStatus ] = useState( STATUS_PROCESSING );

	const exportKit = useCallback( async () => {
		try {
			setStatus( STATUS_PROCESSING );

			const exportData = {
				include: includes,
				kitInfo: {
					title: kitInfo.title?.trim() || null,
					description: kitInfo.description?.trim() || null,
					source: kitInfo.source,
				},
				plugins: plugins || [],
				selectedCustomPostTypes: [],
			};

			const isCloudKitFeatureActive = elementorCommon?.config?.experimentalFeatures?.[ 'cloud-library' ];
			const isCloudExport = 'cloud' === kitInfo.source;

			if ( isCloudKitFeatureActive && isCloudExport ) {
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
				};

				dispatch( { type: 'SET_EXPORTED_DATA', payload: exportedData } );
			} else {
				throw new Error( 'Invalid response format from server' );
			}

			window.location.href = elementorAppConfig.base_url + '#/export-customization/complete';
		} catch ( error ) {
			setStatus( STATUS_ERROR );
		}
	}, [ includes, kitInfo, plugins, dispatch ] );

	useEffect( () => {
		exportKit();
	}, [ isExportProcessStarted, exportKit ] );

	return {
		status,
		STATUS_PROCESSING,
		STATUS_ERROR,
	};
};
