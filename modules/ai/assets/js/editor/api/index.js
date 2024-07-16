const request = ( endpoint, data = {}, immediately = false, signal ) => {
	if ( Object.keys( data ).length ) {
		data.context = window.elementorAiCurrentContext;
	}

	return new Promise( ( resolve, reject ) => {
		const ajaxData = elementorCommon.ajax.addRequest(
			endpoint,
			{
				success: resolve,
				error: reject,
				data,
			},
			immediately,
		);

		if ( signal && ajaxData.jqXhr ) {
			signal.addEventListener( 'abort', ajaxData.jqXhr.abort );
		}
	} );
};

export const getUserInformation = ( immediately ) => request( 'ai_get_user_information', undefined, immediately );

export const getRemoteConfig = () => request( 'ai_get_remote_config' );

export const getCompletionText = ( payload ) => request( 'ai_get_completion_text', { payload } );

export const getExcerpt = ( payload ) => request( 'ai_get_excerpt', { payload } );

export const getFeaturedImage = ( payload ) => request( 'ai_get_featured_image', { payload } );

export const getEditText = ( payload ) => request( 'ai_get_edit_text', { payload } );

export const getCustomCode = ( payload ) => request( 'ai_get_custom_code', { payload } );

export const getCustomCSS = ( payload ) => request( 'ai_get_custom_css', { payload } );

export const setGetStarted = () => request( 'ai_set_get_started' );

export const setStatusFeedback = ( responseId ) => request( 'ai_set_status_feedback', { response_id: responseId } );

export const getTextToImageGeneration = ( payload ) => request( 'ai_get_text_to_image', { payload } );

export const getImageToImageGeneration = ( payload ) => request( 'ai_get_image_to_image', { payload } );

export const getImageToImageMaskGeneration = ( payload ) => request( 'ai_get_image_to_image_mask', { payload } );

export const getImageToImageOutPainting = ( payload ) => request( 'ai_get_image_to_image_outpainting', { payload } );

export const getImageToImageUpscale = ( payload ) => request( 'ai_get_image_to_image_upscale', { payload } );

export const getImageToImageRemoveBackground = ( payload ) => request( 'ai_get_image_to_image_remove_background', { payload } );

export const getImageToImageReplaceBackground = ( payload ) => request( 'ai_get_image_to_image_replace_background', { payload } );

export const getImageToImageRemoveText = ( image ) => request( 'ai_get_image_to_image_remove_text', { image } );

export const getImagePromptEnhanced = ( prompt ) => request( 'ai_get_image_prompt_enhancer', { prompt } );

export const uploadImage = ( image ) => request( 'ai_upload_image', { ...image } );

/**
 * @typedef {Object} AttachmentPropType - See ./types/attachment.js
 * @typedef {Object} requestBody
 * @property {string}               prompt             - Prompt to generate the layout from.
 * @property {0|1|2}                [variationType]    - Type of the layout to generate (actually it's a position).
 * @property {string[]}             [prevGeneratedIds] - Previously generated ids for exclusion on regeneration.
 * @property {AttachmentPropType[]} [attachments]      - Attachments to use for the generation. currently only `json` type is supported - a container JSON to generate variations from.
 */

/**
 * @param {requestBody} requestBody
 * @param {AbortSignal} [signal]
 */
export const generateLayout = ( requestBody, signal ) => request( 'ai_generate_layout', requestBody, true, signal );

export const getLayoutPromptEnhanced = ( prompt, enhanceType ) => request( 'ai_get_layout_prompt_enhancer', {
	prompt,
	enhance_type: enhanceType,
} );

export const getHistory = ( type, page, limit ) => request( 'ai_get_history', { type, page, limit } );

export const deleteHistoryItem = ( id ) => request( 'ai_delete_history_item', { id } );

export const toggleFavoriteHistoryItem = ( id ) => request( 'ai_toggle_favorite_history_item', { id } );
