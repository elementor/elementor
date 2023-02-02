import { createSlice } from './store';

export type DocumentStatus = 'publish' | 'future' | 'draft' | 'pending' | 'private' | 'trash' | 'auto-draft' | 'inherit';

export type Document = {
	id: number,
	title: string,
	type: string,
	status: DocumentStatus,
	isDirty: boolean,
	isSaving: boolean,
	isSavingDraft: boolean,
	userCan: {
		publish?: boolean,
	},
};

export type Slice = ReturnType<typeof createSlice>;

export type ExtendedWindow = Window & {
	elementor: {
		documents: {
			documents: Record<string, V1Document>,
			getCurrentId: () => number,
			getInitialId: () => number,
			getCurrent: () => V1Document,
		}
	}
}

export type V1Document = {
	id: number,
	config: {
		type: string,
		user: {
			can_publish: boolean,
		},
		revisions: {
			current_id: number,
		}
	},
	editor: {
		isChanged: boolean,
		isSaving: boolean,
	},
	container: {
		settings: V1Model<{
			post_title: string,
			post_status: DocumentStatus
		}>,
	}
}

type V1Model<T> = {
	get: <K extends keyof T = keyof T>( key: K ) => T[K],
}
