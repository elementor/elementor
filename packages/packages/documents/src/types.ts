import { createSlice } from './store';

export type State = {
	documents: Record<Document['id'], Document>,
	currentDocumentId: Document['id'],
}

export type Document = {
	id: number,
	title: string,
	status: string, // TODO: union?
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
			post_status: string,
		}>,
	}
}

type V1Model<T> = {
	get: <K extends keyof T = keyof T>( key: K ) => T[K],
}
