import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Stack, Button } from '@elementor/ui';
import { BaseLayout, TopBar, PageHeader } from '../../components';
import { useExportContext } from '../../context/export-context';

export default function ExportProcess() {
	const { data, dispatch } = useExportContext();
	const [ status, setStatus ] = useState( 'processing' ); // processing, error

	const { kitInfo, includes, plugins, isExportProcessStarted } = data;

	const HELP_URL = 'https://go.elementor.com/app-import-download-failed';

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

				// Simulate success - navigate directly without showing success state
				const mockResponse = {
					file: kitInfo.source === 'file' ? 'https://example.com/export.zip' : null,
					kit: kitInfo.source === 'cloud' ? { id: 123, name: kitInfo.title } : null,
				};

				dispatch( { type: 'SET_EXPORTED_DATA', payload: mockResponse } );
				
				window.location.href = elementorAppConfig.base_url + '#/export-customization/complete';

			} catch ( error ) {
				setStatus( 'error' );
			}
		};

		performExport();
	}, [ isExportProcessStarted, includes, kitInfo, plugins, dispatch ] );

	const handleTryAgain = () => {
		window.location.href = elementorAppConfig.base_url + '#/export-customization/';
	};

	const handleLearnMore = () => {
		window.open( HELP_URL, '_blank' );
	};

	const getStatusText = () => {
		if ( status === 'processing' ) {
			return __( 'Setting up your website template...', 'elementor' );
		}

		return __( 'Export failed', 'elementor' );
	};

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	return (
		<BaseLayout topBar={ <TopBar>{ headerContent }</TopBar> }>
			<Box sx={ { 
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: 'calc(100vh - 120px)',
				p: 3
			} }>
				<Box sx={ { 
					maxWidth: '600px',
					textAlign: 'center',
					width: '100%'
				} }>
				<Stack spacing={ 3 } alignItems="center">
					{ status === 'processing' && (
						<>
							<CircularProgress size={ 60 } />
							<Typography variant="h5" component="h2">
								{ getStatusText() }
							</Typography>
							<Typography variant="body1" color="text.secondary">
								{ __( 'This usually takes a few moments.', 'elementor' ) }
                                <br/>
                                { __( "Don't close this window until the process is finished.", 'elementor' ) }
							</Typography>
						</>
					) }
					
					{ status === 'error' && (
						<>
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

							<Typography variant="h5" component="h2">
								{ getStatusText() }
							</Typography>

							<Typography variant="body1" color="text.secondary">
								{ __( 'We couldn\'t complete the export. Please try again, and if the problem persists, check our help guide for troubleshooting steps.', 'elementor' ) }
							</Typography>

							<Stack direction="row" spacing={ 2 }>
								<Button variant="contained" onClick={ handleTryAgain }>
									{ __( 'Try Again', 'elementor' ) }
								</Button>
								<Button variant="outlined" onClick={ handleLearnMore }>
									{ __( 'Learn More', 'elementor' ) }
								</Button>
							</Stack>
						</>
					) }
				</Stack>
				</Box>
			</Box>
		</BaseLayout>
	);
}
