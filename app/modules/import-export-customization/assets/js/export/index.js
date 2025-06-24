import Button from '@elementor/ui/Button';
import Box from '@elementor/ui/Box';
import Typography from '@elementor/ui/Typography';
import Stack from '@elementor/ui/Stack';
import IconButton from '@elementor/ui/IconButton';

import { BaseLayout, TopBar, Footer } from '../components/layout';

export default function Index() {
	const handleClose = () => {
		window.top.location = elementorAppConfig.admin_url + 'admin.php?page=elementor-tools';
	};

	// Build the TopBar content to maintain the same visual layout
	const topBarContent = (
		<>
			{/* Start Content */}
			<Box sx={ { display: 'flex', alignItems: 'center', flex: '0 0 auto' } }>
				<Stack direction="row" spacing={ 2 } alignItems="center">
					<Box
						component="i"
						sx={ {
							fontSize: 24,
							color: 'primary.main',
						} }
						className="eicon-elementor"
					/>
					<Typography
						variant="h6"
						component="h1"
						sx={ {
							fontWeight: 600,
						} }
					>
						{ __( 'Export Kit', 'elementor' ) }
					</Typography>
				</Stack>
			</Box>

			{/* Center Content */}
			<Box sx={ { display: 'flex', alignItems: 'center', flex: '1 1 auto', justifyContent: 'center' } }>
				{/* Empty center space */}
			</Box>

			{/* End Content */}
			<Box sx={ { display: 'flex', alignItems: 'center', flex: '0 0 auto' } }>
				<Button
					variant="outlined"
					size="small"
					startIcon={ <Box component="i" className="eicon-help-o" /> }
				>
					{ __( 'Help', 'elementor' ) }
				</Button>
				<IconButton
					onClick={ handleClose }
					sx={ { ml: 1 } }
					aria-label={ __( 'Close', 'elementor' ) }
				>
					<Box component="i" className="eicon-close" />
				</IconButton>
			</Box>
		</>
	);

	// Build the Footer content to maintain the same visual layout
	const footerContent = (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="space-between"
			spacing={ 2 }
		>
			{/* Start Content */}
			<Box sx={ { flex: '0 0 auto' } }>
				<Typography variant="body2" color="text.secondary">
					{ __( 'Version 1.0.0', 'elementor' ) }
				</Typography>
			</Box>

			{/* Center Content */}
			<Box sx={ { flex: '1 1 auto', textAlign: 'center' } }>
				{/* Empty center space */}
			</Box>

			{/* End Content */}
			<Box sx={ { flex: '0 0 auto' } }>
				<Stack direction="row" spacing={ 1 }>
					<Button
						variant="outlined"
						size="small"
					>
						{ __( 'Cancel', 'elementor' ) }
					</Button>
					<Button
						variant="contained"
						color="primary"
						size="small"
					>
						{ __( 'Export Kit', 'elementor' ) }
					</Button>
				</Stack>
			</Box>
		</Stack>
	);

	return (
		<BaseLayout
			topBar={ <TopBar>{ topBarContent }</TopBar> }
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
