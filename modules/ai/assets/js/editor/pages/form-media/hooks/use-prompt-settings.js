import { useState } from 'react';
import { IMAGE_PROMPT_SETTINGS } from '../constants';

export const { IMAGE_TYPE, IMAGE_STYLE, IMAGE_STRENGTH, IMAGE_RATIO, IMAGE_ZOOM, IMAGE_UPSCALE, IMAGE_BACKGROUND_COLOR } = IMAGE_PROMPT_SETTINGS;

const DEFAULT_TYPE = '';
const DEFAULT_STYLE = '';
const DEFAULT_STRENGTH = 0;
const DEFAULT_RATIO = '1:1';
const DEFAULT_ZOOM = '1';
const DEFAULT_UPSCALE = '512';
const DEFAULT_COLOR = '#FFFFFF';

const usePromptSettings = ( {
	type = DEFAULT_TYPE,
	style = DEFAULT_STYLE,
	imageWeight = DEFAULT_STRENGTH,
	aspectRatio = DEFAULT_RATIO,
	zoom = DEFAULT_ZOOM,
	upScaleTo = DEFAULT_UPSCALE,
	bgColor = DEFAULT_COLOR,
} = {} ) => {
	const [ settings, setSettings ] = useState( {
		[ IMAGE_TYPE ]: type,
		[ IMAGE_STYLE ]: style,
		[ IMAGE_STRENGTH ]: imageWeight,
		[ IMAGE_RATIO ]: aspectRatio,
		[ IMAGE_ZOOM ]: zoom,
		[ IMAGE_UPSCALE ]: upScaleTo,
		[ IMAGE_BACKGROUND_COLOR ]: bgColor,
	} );

	const updateSettings = ( updated ) => setSettings( ( prev ) => ( { ...prev, ...updated } ) );

	const resetSettings = () => {
		setSettings( {
			[ IMAGE_TYPE ]: type,
			[ IMAGE_STYLE ]: DEFAULT_STYLE,
			[ IMAGE_STRENGTH ]: DEFAULT_STRENGTH,
			[ IMAGE_RATIO ]: aspectRatio,
			[ IMAGE_ZOOM ]: DEFAULT_ZOOM,
			[ IMAGE_UPSCALE ]: DEFAULT_UPSCALE,
			[ IMAGE_BACKGROUND_COLOR ]: bgColor,
		} );
	};

	return {
		settings,
		updateSettings,
		resetSettings,
	};
};

export default usePromptSettings;
