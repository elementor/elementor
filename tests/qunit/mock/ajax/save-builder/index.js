import * as mock from './mock';

export const saveBuilder = ( action, fullParams ) => {
	switch ( action.data.status ) {
		case 'draft':
			return mock.draft;

		case 'autosave':
			return mock.autosave;

		case 'publish':
			return mock.publish;

		case 'pending':
			return mock.pending;

		case 'private':
			return mock.private;

		default: return {
			success: false,
			code: 500,
			data: {
				statusText: 'AJAX Mock: action: "save_builder" invalid status:' + action.data.status,
			},
			dumpParams: fullParams,
		};
	}
};

export default saveBuilder;
