import PromptActionSelection from '../../../components/prompt-action-selection';
import { IMAGE_ASPECT_RATIO } from '../constants';

const imageRatios = Object.entries( IMAGE_ASPECT_RATIO ).map( ( [ value, { label } ] ) => ( { label, value } ) );

const ImageRatioSelect = ( props ) => {
	return (
		<PromptActionSelection
			options={ imageRatios }
			wrapperStyle={ { width: '100%' } }
			label={ __( 'Aspect ratio', 'elementor' ) }
			{ ...props }
		/>
	);
};

export default ImageRatioSelect;
