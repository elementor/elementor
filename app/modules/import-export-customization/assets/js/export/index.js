import { LocationProvider } from '@reach/router';
import router from '@elementor/router';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Button from '@elementor/ui/Button';
import Box from '@elementor/ui/Box';

export default function Index() {
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
							>
								{ __( 'Export Kit', 'elementor' ) }
							</Button>
						</Box>
					</Box>
				</LocationProvider>
			</ThemeProvider>
		</DirectionProvider>
	);
}
