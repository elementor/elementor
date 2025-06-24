import { Button, Box, Typography, Stack } from '@elementor/ui';

import { BaseLayout, TopBar, Footer, PageHeader } from '../components';

export default function Index() {

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			<Button
				variant="contained"
				color="primary"
				size="small"
			>
				{ __( 'Next', 'elementor' ) }
			</Button>
		</Stack>
	);

	return (
		<BaseLayout
			topBar={ <TopBar><PageHeader title={ __( 'Export', 'elementor' ) } /></TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<Box sx={ { p: 3, mb: 2 } }>
				<Box sx={ { mb: 2 } }>
					<Typography variant="h4" component="h2" gutterBottom>
						{ __( 'Export Your Website Kit', 'elementor' ) }
					</Typography>
					<Typography variant="body1" color="text.secondary">
						{ __( 'Use the REST API endpoints to export and import your website kits', 'elementor' ) }.
					</Typography>
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
		</BaseLayout>
	);
}
