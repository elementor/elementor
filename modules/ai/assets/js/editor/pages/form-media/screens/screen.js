import ImageLoader from '../../../components/image-loader';
import { IMAGE_PROMPT_SETTINGS, SCREENS } from '../consts/consts';
import FormGenerateResult from './generate-result';
import PromptGallery from './prompt-gallery';
import VariationsPlaceholder from './variations-placeholder';

export const Screen = ( {
	isLoading,
	isUploading,
	screen,
	images,
	generateNewPrompt,
	maybeUploadImage,
	setPrompt,
	promptSettings,
	updatePromptSettings,
} ) => {
	if ( isLoading || isUploading ) {
		return <ImageLoader />;
	}

	if ( screen === SCREENS.GENERATE_RESULTS ) {
		return <FormGenerateResult { ... {
			images,
			generateNewPrompt,
			maybeUploadImage,
		} } />;
	}

	if ( screen === SCREENS.VARIATIONS ) {
		return <VariationsPlaceholder />;
	}

	return <PromptGallery { ...{
		setPrompt,
		maybeUploadImage,
		updatePromptSettings,
		selectedCategory: promptSettings[ IMAGE_PROMPT_SETTINGS.STYLE_PRESET ],
	} } />;
};

Screen.propTypes = {
	isLoading: PropTypes.bool.isRequired,
	isUploading: PropTypes.bool.isRequired,
	screen: PropTypes.string,
	images: PropTypes.array,
	generateNewPrompt: PropTypes.func,
	maybeUploadImage: PropTypes.func,
	setPrompt: PropTypes.func,
	promptSettings: PropTypes.object,
	updatePromptSettings: PropTypes.func,
};
