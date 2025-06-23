import Button from '@elementor/ui/Button';
import Box from '@elementor/ui/Box';
import Typography from '@elementor/ui/Typography';
import Stack from '@elementor/ui/Stack';

import { BaseLayout } from '../components/layout';

export default function Index() {
	const topBarProps = {
		title: __( 'Export Kit', 'elementor' ),
		showCloseButton: true,
		endContent: (
			<Button
				variant="outlined"
				size="small"
				startIcon={ <Box component="i" className="eicon-help-o" /> }
			>
				{ __( 'Help', 'elementor' ) }
			</Button>
		),
	};

	const footerProps = {
		startContent: (
			<Typography variant="body2" color="text.secondary">
				{ __( 'Version 1.0.0', 'elementor' ) }
			</Typography>
		),
		endContent: (
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
		),
	};

	return (
		<BaseLayout
			topBarProps={ topBarProps }
			footerProps={ footerProps }
			showFooter={ true }
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
