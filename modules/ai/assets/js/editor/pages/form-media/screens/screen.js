import { useMemo } from 'react';
import ImageLoader from './image-loader';
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
	/**
	 * The aspect ratio value should be changed only when getting a new instance of the images array.
	 * Otherwise, each change of the selection will cause a re-render and will affect the current images.
	 */
	const cachedAspectRation = useMemo( () => promptSettings[ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ], [ images ] );

	if ( isLoading || isUploading ) {
		return <ImageLoader />;
	}

	if ( screen === SCREENS.GENERATE_RESULTS ) {
		return <FormGenerateResult { ... {
			images,
			generateNewPrompt,
			maybeUploadImage,
			aspectRatio: cachedAspectRation,
		} } />;
	}

	if ( screen === SCREENS.VARIATIONS ) {
		return <VariationsPlaceholder />;
	}

	return <PromptGallery { ...{
		setPrompt,
		maybeUploadImage,
		updatePromptSettings,
		selectedCategory: promptSettings[ IMAGE_PROMPT_SETTINGS.IMAGE_TYPE ],
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
