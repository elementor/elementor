const getJsonMock = ( data: AiData ) => {
	return {
		success: true,
		data: {
			responses: {
				ai_get_user_information: data,
			},
		},
	};
};

export const userInformationMock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		is_connected: true,
		is_get_started: '1',
		usage: {
			hasAiSubscription: false,
			usedQuota: 2,
			quota: 100,
		},
	},
} );

export const freeUserInformationExceededQuota80Mock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		is_connected: true,
		is_get_started: '1',
		usage: {
			hasAiSubscription: false,
			usedQuota: 80,
			quota: 100,
		},
	},
} );

export const freeUserInformationExceededQuota95Mock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		is_connected: true,
		is_get_started: '1',
		usage: {
			hasAiSubscription: false,
			usedQuota: 95,
			quota: 100,
		},
	},
} );

export const paidUserInformationExceededQuota80Mock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		is_connected: true,
		is_get_started: '1',
		usage: {
			hasAiSubscription: true,
			usedQuota: 80,
			quota: 100,
		},
	},
} );

export const paidUserInformationExceededQuota95Mock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		is_connected: true,
		is_get_started: '1',
		usage: {
			hasAiSubscription: true,
			usedQuota: 95,
			quota: 100,
		},
	},
} );

export const userInformationNoConnectedMock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		is_connected: false,
		is_get_started: '',
		usage: {
			hasAiSubscription: false,
			usedQuota: 0,
			quota: 100,
		},
	},
} );

export const userInformationConnectedNoGetStartedMock = getJsonMock( {
	success: true,
	code: 200,
	data: {
		is_connected: true,
		is_get_started: '',
		usage: {
			hasAiSubscription: false,
			usedQuota: 0,
			quota: 100,
		},
	},
} );

type AiData = {
	success: boolean
	code: number
	data: {
		is_connected: boolean
		is_get_started: string
		usage: {
			hasAiSubscription: boolean
			usedQuota: number
			quota: number
		},
	}
}
