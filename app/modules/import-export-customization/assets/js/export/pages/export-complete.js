import React, { useEffect } from 'react';
import { Button, Box, Typography, Stack, Link, Card, CardContent } from '@elementor/ui';
import { BaseLayout, TopBar, Footer, PageHeader } from '../../components';
import { useExportContext } from '../../context/export-context';

export default function ExportComplete() {
	const { data, dispatch } = useExportContext();
	const { exportedData, kitInfo } = data;

	useEffect( () => {
		if ( ! exportedData ) {
			// Redirect back if no export data
			window.location.href = elementorAppConfig.base_url + '#/export-customization/';
		}
	}, [ exportedData ] );

	if ( ! exportedData ) {
		return null;
	}

	const isCloudExport = kitInfo.source === 'cloud';
	const downloadUrl = exportedData.file;

	const handleDownload = () => {
		if ( downloadUrl ) {
			window.open( downloadUrl, '_blank' );
		}
	};

	const handleNewExport = () => {
		// Reset export context and go back to export page
		dispatch( { type: 'SET_EXPORTED_DATA', payload: null } );
		dispatch( { type: 'SET_IS_EXPORT_PROCESS_STARTED', payload: false } );
		dispatch( { type: 'SET_KIT_TITLE', payload: '' } );
		dispatch( { type: 'SET_KIT_DESCRIPTION', payload: '' } );
		dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: null } );
		window.location.href = elementorAppConfig.base_url + '#/export-customization/';
	};

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			<Button
				variant="outlined"
				color="secondary"
				size="small"
				onClick={ handleNewExport }
			>
				{ __( 'Export Another', 'elementor' ) }
			</Button>
			
			{ ! isCloudExport && downloadUrl && (
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ handleDownload }
				>
					{ __( 'Download File', 'elementor' ) }
				</Button>
			) }
			
			{ isCloudExport && (
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ () => window.location.href = elementorAppConfig.base_url + '#/kit-library' }
				>
					{ __( 'View in Library', 'elementor' ) }
				</Button>
			) }
		</Stack>
	);

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<Box sx={ { p: 3, mb: 2, maxWidth: '600px', mx: 'auto', textAlign: 'center', mt: 4 } }>
				<Stack spacing={ 3 } alignItems="center">
					{/* Success Icon */}
					<Box sx={ { 
						width: 80, 
						height: 80, 
						borderRadius: '50%', 
						backgroundColor: 'success.main',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: 'white',
						fontSize: '32px',
						mb: 2
					} }>
						✓
					</Box>

					<Typography variant="h4" component="h2" gutterBottom>
						{ isCloudExport 
							? __( 'Saved to Cloud Library!', 'elementor' )
							: __( 'Export Complete!', 'elementor' )
						}
					</Typography>

					<Typography variant="body1" color="text.secondary" sx={ { mb: 3 } }>
						{ isCloudExport 
							? __( 'Your website template has been successfully saved to your cloud library and is ready to use.', 'elementor' )
							: __( 'Your website template has been exported and is ready for download.', 'elementor' )
						}
					</Typography>

					{/* Export Details Card */}
					<Card sx={ { width: '100%', border: 1, borderRadius: 1, borderColor: 'action.focus' } } elevation={ 0 }>
						<CardContent sx={ { p: 2.5 } }>
							<Typography variant="h6" component="h3" gutterBottom>
								{ kitInfo.title }
							</Typography>
							
							{ kitInfo.description && (
								<Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
									{ kitInfo.description }
								</Typography>
							) }

							<Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
								{ __( 'Exported items:', 'elementor' ) }
							</Typography>
							<Typography variant="body2">
								{ data.includes.map( item => {
									const itemLabels = {
										content: __( 'Content', 'elementor' ),
										templates: __( 'Templates', 'elementor' ),
										settings: __( 'Settings & configurations', 'elementor' ),
										plugins: __( 'Plugins', 'elementor' )
									};
									return itemLabels[ item ] || item;
								} ).join( ', ' ) }
							</Typography>

							{ isCloudExport && exportedData.kit && (
								<>
									<Typography variant="caption" color="text.secondary" sx={ { display: 'block', mt: 2, mb: 1 } }>
										{ __( 'Cloud Library ID:', 'elementor' ) }
									</Typography>
									<Typography variant="body2">
										#{ exportedData.kit.id }
									</Typography>
								</>
							) }
						</CardContent>
					</Card>

					{ ! isCloudExport && (
						<Typography variant="body2" color="text.secondary">
							{ __( 'You can use this file to import the template on any WordPress site with Elementor.', 'elementor' ) }{' '}
							<Link href="https://go.elementor.com/app-what-are-kits" target="_blank" rel="noopener noreferrer">
								{ __( 'Learn more', 'elementor' ) }
							</Link>
						</Typography>
					) }
				</Stack>
			</Box>
		</BaseLayout>
	);
}
