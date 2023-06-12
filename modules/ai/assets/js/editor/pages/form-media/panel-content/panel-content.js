import { PANELS } from '../consts/consts';
import ImagePromptForm from './image-prompt-form';
import ImageVariationsForm from './image-variations-form';
import ImageTools from './image-tools';
import InPaintingForm from './in-painting-form';
import OutPaintingForm from './out-painting-form';
import UpscaleForm from './upscale-form';

export const PanelContent = ( {
	error,
	images,
	submitPrompt,
	generateNewPrompt,
	promptSettings,
	updatePromptSettings,
	editImage,
	panel,
	prompt,
	setPrompt,
	panelActive,
	setTool,
	maskImage,
	reset,
	viewData,
} ) => {
	const backToTools = () => {
		// TODO: Temp solution for preventing the error message to follow to other screens.
		if ( error ) {
			reset();
		}

		setTool( false );
	};

	const commonProps = {
		prompt,
		setPrompt,
		panelActive,
		generateNewPrompt,
		promptSettings,
		updatePromptSettings,
		submitPrompt,
		error,
		images,
		backToTools,
	};

	if ( panel === PANELS.TEXT_TO_IMAGE ) {
		return <ImagePromptForm { ...commonProps } />;
	}

	if ( panel === PANELS.IMAGE_TO_IMAGE ) {
		return <ImageVariationsForm { ...{
			editImage,
			...commonProps,
		} } />;
	}

	if ( panel === PANELS.IN_PAINTING ) {
		return <InPaintingForm { ...{
			editImage,
			...commonProps,
			disableAspectRatio: true,
			maskImage,
		} } />;
	}

	if ( panel === PANELS.OUT_PAINTING ) {
		return <OutPaintingForm { ...{
			editImage,
			...commonProps,
			disableAspectRatio: true,
			maskImage,
			viewData,
		} } />;
	}

	if ( panel === PANELS.UPSCALE ) {
		return <UpscaleForm { ...{
			editImage,
			...commonProps,
		} } />;
	}

	return <ImageTools { ...{
		setTool,
		generateNewPrompt,
		panelActive,
	} } />;
};

PanelContent.propTypes = {
	error: PropTypes.any.isRequired,
	images: PropTypes.array,
	generateNewPrompt: PropTypes.func,
	promptSettings: PropTypes.object,
	updatePromptSettings: PropTypes.func,
	editImage: PropTypes.object,
	submitPrompt: PropTypes.func,
	panel: PropTypes.string,
	prompt: PropTypes.string,
	setPrompt: PropTypes.func,
	panelActive: PropTypes.bool,
	setTool: PropTypes.func,
	maskImage: PropTypes.string,
	reset: PropTypes.func,
	viewData: PropTypes.object,
};
