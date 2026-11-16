import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

import { AGENTS_WORD_GRADIENT } from '../constants';

const agentsWordSx = {
	backgroundImage: AGENTS_WORD_GRADIENT,
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',
};

export const PageTitle = ( { textAlign = 'center' } ) => {
	return (
		<Typography
			component="h2"
			variant="h4"
			fontWeight={ 300 }
			textAlign={ textAlign }
			m={ 0 }
			fontSize="2.5rem"
			color="transparent"
			sx={ agentsWordSx }
		>
			{ __( 'Is your site ready for agents?', 'elementor' ) }
		</Typography>
	);
};

PageTitle.propTypes = {
	textAlign: PropTypes.string,
};
