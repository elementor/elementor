const request = ( endpoint, data = {} ) => {
	if ( Object.keys( data ).length ) {
		data.context = window.elementorAiCurrentContext;
	}

	return new Promise( ( resolve, reject ) => elementorCommon.ajax.addRequest(
		endpoint, {
			success: resolve,
			error: reject,
			data,
		},
	) );
};

export const getUserInformation = () => request( 'ai_get_user_information' );

export const getCompletionText = ( prompt ) => request( 'ai_get_completion_text', { prompt } );

export const getEditText = ( input, instruction ) => request( 'ai_get_edit_text', { input, instruction } );

export const getCustomCode = ( prompt, language ) => request( 'ai_get_custom_code', { prompt, language } );

export const getCustomCSS = ( prompt, htmlMarkup, elementId ) => request( 'ai_get_custom_css', { prompt, html_markup: htmlMarkup, element_id: elementId } );

export const setGetStarted = () => request( 'ai_set_get_started' );

export const setStatusFeedback = ( responseId ) => request( 'ai_set_status_feedback', { response_id: responseId } );

export const getTextToImageGeneration = ( prompt, promptSettings ) => request( 'ai_get_text_to_image', { prompt, promptSettings } );

export const getImageToImageGeneration = ( prompt, promptSettings, image ) => request( 'ai_get_image_to_image', { prompt, promptSettings, image } );

export const getImageToImageMaskGeneration = ( prompt, promptSettings, image, mask ) => request( 'ai_get_image_to_image_mask', { prompt, promptSettings, image, mask } );

export const getImageToImageOutPainting = ( prompt, promptSettings, image, mask ) => request( 'ai_get_image_to_image_outpainting', { prompt, promptSettings, mask } );

export const getImageToImageUpscale = ( prompt, promptSettings, image ) => request( 'ai_get_image_to_image_upscale', { prompt, promptSettings, image } );

export const getImageToImageRemoveBackground = ( image ) => request( 'ai_get_image_to_image_remove_background', { image } );

export const getImageToImageReplaceBackground = ( prompt, image ) => request( 'ai_get_image_to_image_replace_background', { prompt, image } );

export const getImageToImageRemoveText = ( image ) => request( 'ai_get_image_to_image_remove_text', { image } );

export const getImagePromptEnhanced = ( prompt ) => request( 'ai_get_image_prompt_enhancer', { prompt } );

export const uploadImage = ( image ) => request( 'ai_upload_image', { ...image } );
