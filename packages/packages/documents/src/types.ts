import { createSlice } from './store';

export type State = {
	entities: Record<Document['id'], Document>,
	currentId: Document['id'],
}

export type Document = {
	id: number,
	title: string,
	status: 'publish' | 'future' | 'draft' | 'pending' | 'private' | 'trash' | 'auto-draft' | 'inherit',
	isModified: boolean,
	isSaving: boolean,
	isSavingDraft: boolean,
	userCan: {
		publish: boolean,
	},
};

export type Slice = ReturnType<typeof createSlice>;

export type PartialDocument = Partial<Omit<Document, 'id'>> & Pick<Document, 'id'>;

export type ExtendedWindow = Window & {
	elementor: {
		documents: {
			documents: Record<string, V1Document>,
			getCurrentId: () => number,
			getCurrent: () => V1Document,
		}
	}
}

export type V1Document = {
	id: number,
	config: {
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
			post_status: Document['status'],
		}>,
	}
}

type V1Model<T> = {
	get: <K extends keyof T = keyof T>( key: K ) => T[K],
}
