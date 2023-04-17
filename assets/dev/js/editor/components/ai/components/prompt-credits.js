import { Typography } from '@elementor/ui';

const PromptCredits = ( props ) => {
	return <div></div>;

	return (
		<Typography variant="caption" color="text.tertiary">
			{
				/* Translators: %s: AI prompt remained credits. */
				sprintf( __( 'You have %s credits left. Upgrade to unlock more.', 'elementor' ), props.credits )
			}
		</Typography>
	);
};

export default PromptCredits;
