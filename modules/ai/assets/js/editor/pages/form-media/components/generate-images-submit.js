import GenerateButton from '../../../components/generate-button';
import { __ } from '@wordpress/i18n';
import VoicePromotionAlert from '../../../components/voice-promotion-alert';

const GenerateImagesSubmit = ( props ) => {
	return (
		<>
			<GenerateButton size="medium" fullWidth { ...props }>
				{ __( 'Generate images', 'elementor' ) }
			</GenerateButton>
			<VoicePromotionAlert introductionKey="ai-context-media-promotion" />
		</>
	);
};

export default GenerateImagesSubmit;
