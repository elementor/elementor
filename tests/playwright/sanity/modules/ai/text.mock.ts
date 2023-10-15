const getJsonMock = ( data ) => {
	return {
		success: true,
		data: {
			responses: data,
		},
	};
};

export const completionTextMock = getJsonMock( {
	ai_get_completion_text: {
		success: true,
		code: 200,
		data: {
			text: 'Response Prompt',
			response_id: 'xxxxxxxx',
			usage: {
				hasAiSubscription: false,
				usedQuota: 2,
				quota: 100,
			},
		},
	},
} );

export const editTextMock = getJsonMock( {
	ai_get_edit_text: {
		success: true,
		code: 200,
		data: {
			text: 'Response Prompt Shorter',
			response_id: 'xxxxxxxx',
			usage: {
				hasAiSubscription: false,
				usedQuota: 2,
				quota: 100,
			},
		},
	},
} );
