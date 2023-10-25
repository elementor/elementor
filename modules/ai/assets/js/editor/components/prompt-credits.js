import { Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const PromptCredits = ( props ) => {
	if ( props.usagePercentage < 80 ) {
		return null;
	}
	const upgradeLink = props.usagePercentage < 100 ? 'https://go.elementor.com/ai-popup-purchase-limit-reached-80-percent/' : 'https://go.elementor.com/ai-popup-purchase-limit-reached/';
	return (
		<Typography variant="caption" color="text.tertiary">
			{
				/* Translators: %s: AI prompt remained credits. */
				sprintf( __( 'You\'ve used %s of your Elementor AI plan.', 'elementor' ), props.usagePercentage + '%' )
			}
			{ ' ' }
			<a href={ upgradeLink } target="_blank" rel="noreferrer">{ __( 'Upgrade for unlimited access', 'elementor' ) }</a>.
		</Typography>
	);
};

PromptCredits.propTypes = {
	usagePercentage: PropTypes.number.isRequired,
};

export default PromptCredits;
