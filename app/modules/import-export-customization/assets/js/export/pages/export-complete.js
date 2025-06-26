import React, { useEffect, useRef } from 'react';
import { Button, Box, Typography, Stack, Link, Card, CardContent } from '@elementor/ui';
import { BaseLayout, TopBar, Footer, PageHeader } from '../../components';
import { useExportContext } from '../../context/export-context';

const INVALID_FILENAME_CHARS = /[<>:"/\\|?*]/g;

export default function ExportComplete() {
	const { data, dispatch } = useExportContext();
	const { exportedData, kitInfo } = data;
	const downloadLink = useRef( null );

	useEffect( () => {
		if ( ! exportedData ) {
			// Redirect back if no export data
			window.location.href = elementorAppConfig.base_url + '#/export-customization/';
			return;
		}

		// Auto-download file for file exports
		if ( kitInfo.source !== 'cloud' && exportedData.file ) {
			downloadFile();
		}
	}, [ exportedData, kitInfo.source ] );

	const downloadFile = () => {
		if ( ! downloadLink.current ) {
			const link = document.createElement( 'a' );
			
			const defaultKitName = 'elementor-kit';
			const kitName = kitInfo.title || defaultKitName;
			const sanitizedKitName = kitName
				.replace( INVALID_FILENAME_CHARS, '' )
				.trim();
			
			const fileName = sanitizedKitName || defaultKitName;
			
			link.href = exportedData.file;
			link.download = fileName + '.zip';
			
			downloadLink.current = link;
		}
		
		downloadLink.current.click();
	};

	const handleDone = () => {
		window.top.location = elementorAppConfig.admin_url;
	};

	if ( ! exportedData ) {
		return null;
	}

	const isCloudExport = kitInfo.source === 'cloud';

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			{ isCloudExport ? (
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ () => window.location.href = elementorAppConfig.base_url + '#/kit-library/cloud' }
				>
					{ __( 'View in Library', 'elementor' ) }
				</Button>
			) : (
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ handleDone }
				>
					{ __( 'Done', 'elementor' ) }
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
							? __( 'Your website template is now saved to the library!', 'elementor' )
							: __( 'Your .zip file is ready', 'elementor' )
						}
					</Typography>

					<Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
						{ isCloudExport 
							? (
								<>
									{ __( 'You can find it in the My Website Templates tab.', 'elementor' ) }{' '}
									<Link 
										href={ elementorAppConfig.base_url + '#/kit-library/cloud' }
										sx={ { cursor: 'pointer' } }
									>
										{ __( 'Take me there', 'elementor' ) }
									</Link>
								</>
							)
							: __( 'Once the download is complete, you can upload it to be used for other sites.', 'elementor' )
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
							{ __( 'If the download didn\'t start automatically,', 'elementor' ) }{' '}
							<Link href="#" onClick={ downloadFile } sx={ { cursor: 'pointer' } }>
								{ __( 'click here to download manually', 'elementor' ) }
							</Link>
							{'. '}
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
