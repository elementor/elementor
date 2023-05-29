import { useState } from 'react';
import { IMAGE_PROMPT_SETTINGS } from '../pages/form-media/consts/consts';

const usePromptSettings = ( style = '', type = '', imageWeight = 0 ) => {
	const [ promptSettings, setPromptSettings ] = useState( {
		[ IMAGE_PROMPT_SETTINGS.STYLE_PRESET ]: style,
		[ IMAGE_PROMPT_SETTINGS.IMAGE_TYPE ]: type,
		[ IMAGE_PROMPT_SETTINGS.IMAGE_STRENGTH ]: imageWeight,
	} );

	const updatePromptSettings = ( newSettings ) => {
		setPromptSettings( {
			...promptSettings,
			...newSettings,
		} );
	};

	const resetPromptSettings = () => {
		setPromptSettings( {
			[ IMAGE_PROMPT_SETTINGS.STYLE_PRESET ]: '',
			[ IMAGE_PROMPT_SETTINGS.IMAGE_TYPE ]: '',
			[ IMAGE_PROMPT_SETTINGS.IMAGE_STRENGTH ]: 0,
		} );
	};

	return {
		promptSettings,
		updatePromptSettings,
		setPromptSettings,
		resetPromptSettings,
	};
};

export default usePromptSettings;
