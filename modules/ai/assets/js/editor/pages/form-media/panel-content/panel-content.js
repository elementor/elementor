import { PANELS } from '../consts/consts';
import ImagePromptForm from './image-prompt-form';
import ImageVariationsForm from './image-variations-form';

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
} ) => {
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
	};

	if ( panel === PANELS.TEXT_TO_IMAGE ) {
		return <ImagePromptForm { ...commonProps } />;
	}

	return <ImageVariationsForm { ...{
		editImage,
		...commonProps,
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
};
