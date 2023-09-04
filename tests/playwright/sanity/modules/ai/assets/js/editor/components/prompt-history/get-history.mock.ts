import historyItemFixture from './fixtures/prompt-history-item.json';
import { PromptHistoryItem, PromptHistoryResponseData } from './types/types';

const getJsonMock = ( data: PromptHistoryResponseData ) => {
	return {
		success: true,
		data: {
			responses: {
				ai_get_history: data,
			},
		},
	};
};

const generateItem = ( data: Partial<PromptHistoryItem> = {} ): PromptHistoryItem => {
	return { ...historyItemFixture, ...data };
};

export const noPlanMock = getJsonMock( {
	success: false,
	code: 0,
	data: 'invalid_connect_data',
} );

export const noDataMock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		items: [],
		meta: {
			totalItems: 0,
			itemCount: 0,
			itemsPerPage: 10,
			totalPages: 0,
			currentPage: 1,
			allowedDays: 90,
		},
	},
} );

export const differentPeriodsDataMock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		items: [
			generateItem( { createdAt: new Date().toISOString() } ),
			generateItem( { createdAt: new Date( new Date().setDate( new Date().getDate() - 8 ) ).toISOString() } ),
		],
		meta: {
			totalItems: 2,
			itemCount: 2,
			itemsPerPage: 10,
			totalPages: 1,
			currentPage: 1,
			allowedDays: 90,
		},
	},
} );

export const thirtyDaysLimitDataMock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		items: [
			generateItem(),
		],
		meta: {
			totalItems: 1,
			itemCount: 1,
			itemsPerPage: 10,
			totalPages: 1,
			currentPage: 1,
			allowedDays: 30,
		},
	},
} );

export const unknownActionDataMock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		items: [
			generateItem(),
			generateItem( { action: 'unknown-test-action' } ),
		],
		meta: {
			totalItems: 2,
			itemCount: 2,
			itemsPerPage: 10,
			totalPages: 1,
			currentPage: 1,
			allowedDays: 90,
		},
	},
} );

export const reuseAndEditTextDataMock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		items: [
			generateItem( {
				request: {
					prompt: 'Test prompt',
				},
				response: {
					results: {
						text: 'Test result',
					},
				},
			} ),
		],
		meta: {
			totalItems: 1,
			itemCount: 1,
			itemsPerPage: 10,
			totalPages: 1,
			currentPage: 1,
			allowedDays: 90,
		},
	},
} );
