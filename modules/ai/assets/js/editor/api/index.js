const request = ( endpoint, data = {} ) => {
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
