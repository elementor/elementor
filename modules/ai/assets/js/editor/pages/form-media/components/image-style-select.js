import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import PromptActionSelection from '../../../components/prompt-action-selection';
import { IMAGE_PROMPT_CATEGORIES } from '../constants';

const ImageStyleSelect = ( { type = '', ...props } ) => {
	// The image styles are determined by the selected type.
	const imageStyles = Object.entries( IMAGE_PROMPT_CATEGORIES[ type ]?.subCategories || {} ).map( ( [ value, label ] ) => ( { label, value } ) );

	return (
		<PromptActionSelection
			options={ imageStyles }
			wrapperStyle={ { width: '100%' } }
			label={ __( 'Style', 'elementor' ) }
			{ ...props }
		/>
	);
};

ImageStyleSelect.propTypes = {
	type: PropTypes.string.isRequired,
};

export default ImageStyleSelect;
