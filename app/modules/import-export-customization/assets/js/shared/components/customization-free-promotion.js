import { Alert, Typography, Button } from "@elementor/ui";


export function CustomizationFreePromotion() {
	return (
		<Alert color="primary">
			<Typography variant="body1">
				{ __( 'Customization is not available for this kit.', 'elementor' ) }
			</Typography>
			<Button variant="contained" color="primary">
				{ __( 'Go Pro', 'elementor' ) }
			</Button>
		</Alert>
	);
}