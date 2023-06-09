import { useMemo } from 'react';
import ImageLoader from './image-loader';
import { IMAGE_PROMPT_SETTINGS, SCREENS } from '../consts/consts';
import FormGenerateResult from './generate-result';
import PromptGallery from './prompt-gallery';
import VariationsPlaceholder from './variations-placeholder';
import ImagePreview	from './image-preview';
import InPainting from './in-painting';
import OutPainting from './out-painting';

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
	editImage,
	setMaskImage,
	viewData,
	shouldWaitForInitialImage,
} ) => {
	/**
	 * The aspect ratio value should be changed only when getting a new instance of the images array.
	 * Otherwise, each change of the selection will cause a re-render and will affect the current images.
	 */
	const cachedAspectRation = useMemo( () => promptSettings[ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ], [ images ] );

	if ( isLoading || isUploading || shouldWaitForInitialImage ) {
		return <ImageLoader />;
	}

	if ( screen === SCREENS.GENERATE_RESULTS ) {
		return <FormGenerateResult { ... {
			images,
			generateNewPrompt,
			maybeUploadImage,
			aspectRatio: cachedAspectRation,
			viewData,
		} } />;
	}

	if ( screen === SCREENS.VARIATIONS ) {
		return <VariationsPlaceholder />;
	}

	if ( screen === SCREENS.IMAGE_EDITOR ) {
		return <ImagePreview { ...{ editImage } } />;
	}

	if ( screen === SCREENS.IN_PAINTING ) {
		return <InPainting { ...{ editImage, setMaskImage, promptSettings, viewData } } />;
	}

	if ( screen === SCREENS.OUT_PAINTING ) {
		return <OutPainting { ...{ editImage, setMaskImage, promptSettings, viewData } } />;
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
	editImage: PropTypes.object,
	setMaskImage: PropTypes.func,
	viewData: PropTypes.object,
	shouldWaitForInitialImage: PropTypes.bool,
};
