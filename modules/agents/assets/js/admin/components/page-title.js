import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

import { AGENTS_WORD_GRADIENT } from '../constants';

const agentsWordSx = {
	backgroundImage: AGENTS_WORD_GRADIENT,
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',
	color: 'transparent',
	fontSize: '2.5rem',
};

export const PageTitle = ( { textAlign = 'center' } ) => {
	return (
		<Typography
			component="h2"
			variant="h4"
			fontWeight={ 300 }
			textAlign={ textAlign }
			sx={ { m: 0, ...agentsWordSx } }
		>
			{ __( 'Is your site ready for agents?', 'elementor' ) }
		</Typography>
	);
};

PageTitle.propTypes = {
	textAlign: PropTypes.string,
};
