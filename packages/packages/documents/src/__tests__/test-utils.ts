import { Document } from '../';

export function createMockDocument(): Document {
	return {
		id: 1,
		title: 'Document 1',
		status: 'publish',
		type: 'wp-page',
		isDirty: false,
		isSaving: false,
		isSavingDraft: false,
		userCan: {
			publish: true,
		},
	};
}
