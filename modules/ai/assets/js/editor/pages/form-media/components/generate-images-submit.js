import GenerateButton from '../../../components/generate-button';

const GenerateImagesSubmit = ( props ) => {
	return (
		<GenerateButton size="medium" fullWidth { ...props }>
			{ __( 'Generate images', 'elementor' ) }
		</GenerateButton>
	);
};

export default GenerateImagesSubmit;
