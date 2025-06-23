import { LocationProvider } from '@reach/router';
import router from '@elementor/router';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Button from '@elementor/ui/Button';
import Box from '@elementor/ui/Box';
import { useState } from 'react';

export default function Index() {
	const [ isExporting, setIsExporting ] = useState( false );
	const [ exportResult, setExportResult ] = useState( null );

	const handleExportClick = async () => {
		setIsExporting( true );
		setExportResult( null );

		try {
			// Prepare export settings
			const exportSettings = {
				include: [ 'content', 'templates', 'settings' ],
				kitInfo: {
					title: 'My Website Kit',
					description: 'Exported via REST API',
					source: 'file',
				},
				selected_plugins: [],
				selected_cpt: [],
				selected_override_conditions: [],
			};

			// Make REST API request to export endpoint
			const exportUrl = '/wp-json/elementor/v2/import-export-customization/export';
			console.log( 'Calling export endpoint:', exportUrl );
			console.log( 'Export settings:', exportSettings );

			const response = await fetch( exportUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.wpApiSettings?.nonce || '',
				},
				body: JSON.stringify( exportSettings ),
			} );

			console.log( 'Response status:', response.status );
			console.log( 'Response headers:', response.headers );

			if ( ! response.ok ) {
				const errorText = await response.text();
				console.error( 'Error response:', errorText );
				throw new Error( `Export failed: ${ response.status } ${ response.statusText } - ${ errorText }` );
			}

			const result = await response.json();
			console.log( 'Full response:', result );

			// Our REST API returns data in result.data, not result.success
			if ( result.data ) {
				setExportResult( result.data );
				console.log( 'Export successful:', result.data );

				// Create download link for the exported file
				if ( result.data.file_name ) {
					const downloadUrl = result.data.file_name;
					const link = document.createElement( 'a' );
					link.href = downloadUrl;
					link.download = `elementor-kit-${ Date.now() }.zip`;
					document.body.appendChild( link );
					link.click();
					document.body.removeChild( link );
				}
			} else {
				throw new Error( result.message || 'Export failed' );
			}
		} catch ( error ) {
			console.error( 'Export error:', error );
			alert( `Export failed: ${ error.message }` );
			setExportResult( { error: error.message } );
		} finally {
			setIsExporting( false );
		}
	};

	const handleImportClick = () => {
		// Navigate to import page or show import dialog
		console.log( 'Import functionality - to be implemented' );
		alert( 'Import functionality will be implemented next' );
	};

	return (
		<DirectionProvider rtl={ false }>
			<ThemeProvider colorScheme="auto">
				<LocationProvider history={ router.appHistory }>
					<Box sx={ { p: 3, mb: 2, backgroundColor: 'background.paper', borderRadius: 1, boxShadow: 1 } }>
						<Box sx={ { mb: 2 } }>
							<h2>Import/Export Customization</h2>
							<p>Use the REST API endpoints to export and import your website kits.</p>
						</Box>

						<Box sx={ { display: 'flex', gap: 2, mb: 2 } }>
							<Button
								variant="contained"
								color="primary"
								onClick={ handleExportClick }
								disabled={ isExporting }
								sx={ { minWidth: 120 } }
							>
								{ isExporting ? 'Exporting...' : 'Export Kit' }
							</Button>

							<Button
								variant="outlined"
								color="secondary"
								onClick={ handleImportClick }
							>
								Import Kit
							</Button>
						</Box>

						{ exportResult && (
							<Box sx={ {
								p: 2,
								mt: 2,
								backgroundColor: exportResult.error ? 'error.light' : 'success.light',
								borderRadius: 1,
								color: exportResult.error ? 'error.contrastText' : 'success.contrastText',
							} }>
								{ exportResult.error ? (
									<div>
										<strong>Export Failed:</strong>
										<br />
										{ exportResult.error }
									</div>
								) : (
									<div>
										<strong>Export Successful!</strong>
										<br />
										File: { exportResult.file_name }
										<br />
										Manifest: { JSON.stringify( exportResult.manifest, null, 2 ) }
									</div>
								) }
							</Box>
						) }
					</Box>
				</LocationProvider>
			</ThemeProvider>
		</DirectionProvider>
	);
}
