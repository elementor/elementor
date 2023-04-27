import StyledChip from './ui/styled-chip';

const PromptAction = ( props ) => {
	return (
		<StyledChip
			size="large"
			color="secondary"
			variant="outlined"
			{ ...props }
		/>
	);
};

export default PromptAction;
