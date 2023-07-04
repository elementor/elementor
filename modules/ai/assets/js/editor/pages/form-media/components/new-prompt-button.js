import { Button } from '@elementor/ui';

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
