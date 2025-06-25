import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Stack } from '@elementor/ui';
import { BaseLayout, TopBar, PageHeader } from '../../components';
import { useExportContext } from '../../context/export-context';

export default function ExportProcess() {
	const { data, dispatch } = useExportContext();
	const [ status, setStatus ] = useState( 'processing' ); // processing, success, error
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const { kitInfo, includes, plugins, isExportProcessStarted } = data;

	useEffect( () => {
		if ( ! isExportProcessStarted ) {
			// Redirect back if not started from export page
			window.location.href = elementorAppConfig.base_url + '#/export-customization/';
			return;
		}

		// Simulate the export process
		const performExport = async () => {
			try {
				setStatus( 'processing' );

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

				// TODO: Replace with actual export API call
				console.log( 'Export data:', exportData );

				// Simulate API delay
				await new Promise( resolve => setTimeout( resolve, 3000 ) );

				// Simulate success
				const mockResponse = {
					file: kitInfo.source === 'file' ? 'https://example.com/export.zip' : null,
					kit: kitInfo.source === 'cloud' ? { id: 123, name: kitInfo.title } : null,
				};

				dispatch( { type: 'SET_EXPORTED_DATA', payload: mockResponse } );
				setStatus( 'success' );

				// Navigate to success page
				setTimeout( () => {
					window.location.href = elementorAppConfig.base_url + '#/export-customization/complete';
				}, 1000 );

			} catch ( error ) {
				setStatus( 'error' );
				setErrorMessage( error.message || 'Export failed' );
			}
		};

		performExport();
	}, [ isExportProcessStarted, includes, kitInfo, plugins, dispatch ] );

	const getStatusText = () => {
		switch ( status ) {
			case 'processing':
				return kitInfo.source === 'cloud' 
					? __( 'Uploading to cloud library...', 'elementor' )
					: __( 'Preparing export file...', 'elementor' );
			case 'success':
				return __( 'Export completed successfully!', 'elementor' );
			case 'error':
				return __( 'Export failed', 'elementor' );
			default:
				return __( 'Processing...', 'elementor' );
		}
	};

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	return (
		<BaseLayout topBar={ <TopBar>{ headerContent }</TopBar> }>
			<Box sx={ { 
				p: 3, 
				mb: 2, 
				maxWidth: '600px', 
				mx: 'auto',
				textAlign: 'center',
				mt: 8
			} }>
				<Stack spacing={ 3 } alignItems="center">
					{ status === 'processing' && (
						<CircularProgress size={ 60 } />
					) }
					
					{ status === 'success' && (
						<Box sx={ { 
							width: 60, 
							height: 60, 
							borderRadius: '50%', 
							backgroundColor: 'success.main',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							fontSize: '24px'
						} }>
							✓
						</Box>
					) }
					
					{ status === 'error' && (
						<Box sx={ { 
							width: 60, 
							height: 60, 
							borderRadius: '50%', 
							backgroundColor: 'error.main',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							fontSize: '24px'
						} }>
							✕
						</Box>
					) }

					<Typography variant="h5" component="h2">
						{ getStatusText() }
					</Typography>

					{ status === 'processing' && (
						<Typography variant="body1" color="text.secondary">
							{ __( 'Please wait while we process your export...', 'elementor' ) }
						</Typography>
					) }

					{ status === 'error' && (
						<Typography variant="body1" color="error">
							{ errorMessage }
						</Typography>
					) }
				</Stack>
			</Box>
		</BaseLayout>
	);
}
