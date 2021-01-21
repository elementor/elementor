import Button from 'elementor-app/ui/molecules/button';

export default function DashboardButton() {
	return (
		<Button
			variant="contained"
			text={ __( 'Back to dashboard', 'elementor' ) }
			color="primary"
			onClick={ () => {
				if ( window.top === window ) {
					// Directly.
					window.top.location = elementorAppConfig.return_url;
				} else {
					// Iframe.
					window.top.$e.run( 'app/close' );
				}
			} }
		/>
	);
}
