import { Typography } from '@elementor/ui';

const PromptCredits = ( props ) => {
	if ( props.usagePercentage < 80 ) {
		return null;
	}

	return (
		<Typography variant="caption" color="text.tertiary">
			{
				/* Translators: %s: AI prompt remained credits. */
				sprintf( __( 'You\'ve used %s of the free trial.', 'elementor' ), props.usagePercentage + '%' )
			}
			{ ' ' }
			<a href="https://go.elementor.com/ai-popup-purchase-limit-reached-80-percent/" target="_blank" rel="noreferrer">{ __( 'Upgrade for unlimited access', 'elementor' ) }</a>.
		</Typography>
	);
};

PromptCredits.propTypes = {
	usagePercentage: PropTypes.number.isRequired,
};

export default PromptCredits;
