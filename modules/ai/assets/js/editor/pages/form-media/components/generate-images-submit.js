import GenerateButton from '../../../components/generate-button';
import { __ } from '@wordpress/i18n';

const GenerateImagesSubmit = ( props ) => {
	return (
		<GenerateButton size="medium" fullWidth { ...props }>
			{ __( 'Generate images', 'elementor' ) }
		</GenerateButton>
	);
};

export default GenerateImagesSubmit;
