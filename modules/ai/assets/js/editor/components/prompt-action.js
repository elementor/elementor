import { Chip } from '@elementor/ui';

const PromptAction = ( props ) => {
	return (
		<Chip
			size="large"
			color="secondary"
			variant="outlined"
			{ ...props }
		/>
	);
};

export default PromptAction;
