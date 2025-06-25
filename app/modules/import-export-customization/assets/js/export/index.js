import { LocationProvider } from '@reach/router';
import router from '@elementor/router';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Button from '@elementor/ui/Button';
import Box from '@elementor/ui/Box';
import { useState } from 'react';

export default function Index() {
	const [isExporting, setIsExporting] = useState(false);
	const [exportMessage, setExportMessage] = useState('');

	const base_url = elementorAppConfig[ 'import-export-customization' ].restApiBaseUrl;
	const export_url = `${base_url}/export`;

	const handleExportKit = async () => {
		setIsExporting(true);
		setExportMessage('');

		try {
			const response = await fetch(export_url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.wpApiSettings?.nonce || '',
				},
				body: JSON.stringify({
					include: ['templates', 'content', 'settings'],
					kitInfo: {
						title: 'Exported Kit',
						description: 'Kit exported via REST API'
					}
				})
			});

			const result = await response.json();

			if (!response.ok) {
				const errorMessage = result?.data?.message || `HTTP error! with the following code: ${result?.data?.code}`;
				throw new Error(errorMessage);
			}
			
			if (result.data && result.data.file_name) {
				const fileName = result.data.file_name;
				const uploadDir = '/wp-content/uploads/';
				
				const relativePath = fileName.split('/wp-content/uploads/')[1] || fileName.split('uploads/')[1];
				const downloadUrl = uploadDir + relativePath;
				
				const downloadLink = document.createElement('a');
				downloadLink.href = downloadUrl;
				downloadLink.download = result.data.manifest?.name + '.zip' || 'exported-kit.zip';
				downloadLink.style.display = 'none';
				
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
				
				setExportMessage(__('Kit exported and download started!', 'elementor'));
			} else {
				throw new Error('No file name in response');
			}

		} catch (error) {
			setExportMessage(error.message || __('Export failed. Please try again.', 'elementor'));
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<DirectionProvider rtl={ false }>
			<ThemeProvider colorScheme="auto">
				<LocationProvider history={ router.appHistory }>
					<Box sx={ { p: 3, mb: 2 } }>
						<Box sx={ { mb: 2 } }>
							<h2>{ __( 'Import/Export Customization', 'elementor' ) }</h2>
							<p>{ __( 'Use the REST API endpoints to export and import your website kits', 'elementor' ) }.</p>
						</Box>

						<Box sx={ { display: 'flex', gap: 2, mb: 2 } }>
							<Button
								variant="contained"
								color="primary"
								sx={ { minWidth: 120 } }
								onClick={handleExportKit}
								disabled={isExporting}
							>
								{ isExporting ? __( 'Exporting...', 'elementor' ) : __( 'Export Kit', 'elementor' ) }
							</Button>
						</Box>

						{exportMessage && (
							<Box sx={ { mt: 2, p: 2, backgroundColor: exportMessage.includes('failed') ? '#ffebee' : '#e8f5e8', borderRadius: 1 } }>
								<p>{ exportMessage }</p>
							</Box>
						)}
					</Box>
				</LocationProvider>
			</ThemeProvider>
		</DirectionProvider>
	);
}
