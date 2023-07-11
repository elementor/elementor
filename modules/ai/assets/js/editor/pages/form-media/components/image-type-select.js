import PromptActionSelection from '../../../components/prompt-action-selection';
import { IMAGE_PROMPT_CATEGORIES } from '../constants';

const imageTypes = Object.entries( IMAGE_PROMPT_CATEGORIES ).map( ( [ key, { label } ] ) => ( { label, value: key } ) );

const ImageTypeSelect = ( props ) => {
	return (
		<PromptActionSelection
			options={ imageTypes }
			wrapperStyle={ { width: '100%' } }
			label={ __( 'Image type', 'elementor' ) }
			{ ...props }
		/>
	);
};

export default ImageTypeSelect;
