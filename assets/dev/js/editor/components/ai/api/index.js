export const getUserInformation = async () => {
	return await new Promise( ( resolve, reject ) => elementorCommon.ajax.addRequest( 'ai_get_user_information', {
		success: resolve,
		error: reject,
	},
	) );
};

export const getCompletionText = async ( prompt ) => {
	return await new Promise( ( resolve, reject ) => elementorCommon.ajax.addRequest( 'ai_get_completion_text', {
		data: {
			prompt,
		},
		success: resolve,
		error: reject,
	},
	) );
};

export const getEditText = async ( input, instruction ) => {
	return await new Promise( ( resolve, reject ) => elementorCommon.ajax.addRequest( 'ai_get_edit_text', {
		data: {
			input,
			instruction,
		},
		success: resolve,
		error: reject,
	},
	) );
};

export const getCustomCode = async ( prompt, language ) => {
	return await new Promise( ( resolve, reject ) => elementorCommon.ajax.addRequest( 'ai_get_custom_code', {
		data: {
			prompt,
			language,
		},
		success: resolve,
		error: reject,
	},
	) );
};

export const getCustomCSS = async ( prompt, htmlMarkup, elementId ) => {
	return await new Promise( ( resolve, reject ) => elementorCommon.ajax.addRequest( 'ai_get_custom_css', {
		data: {
			prompt,
			html_markup: htmlMarkup,
			element_id: elementId,
		},
		success: resolve,
		error: reject,
	},
	) );
};

export const setGetStarted = async () => {
	return await new Promise( ( resolve, reject ) => elementorCommon.ajax.addRequest( 'ai_set_get_started', {
		success: resolve,
		error: reject,
	},
	) );
};

export const setStatusFeedback = async ( responseId ) => {
	return await new Promise( ( resolve, reject ) => elementorCommon.ajax.addRequest( 'ai_set_status_feedback', {
		data: {
			response_id: responseId,
		},
		success: resolve,
		error: reject,
	},
	) );
};
