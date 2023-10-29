import { Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const NewPromptButton = ( props ) => {
	return (
		<Button
			fullWidth
			variant="text"
			color="secondary"
			{ ...props }
		>
			{ __( 'New prompt', 'elementor' ) }
		</Button>
	);
};

export default NewPromptButton;
