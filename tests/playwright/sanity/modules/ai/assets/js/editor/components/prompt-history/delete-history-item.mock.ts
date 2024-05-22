import { PromptHistoryResponseData } from './types/types';

const getJsonMock = ( data: PromptHistoryResponseData ) => {
	return {
		success: true,
		data: {
			responses: {
				ai_delete_history_item: data,
			},
		},
	};
};

export const successMock = getJsonMock( {
	success: true,
	code: 200,
	data: [],
} );
