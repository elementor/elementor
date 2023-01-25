import { Document } from '../';

type Obj = Record<string, any>;

type Callback<TObj extends Obj> = <
	TKey extends keyof TObj = keyof TObj,
>( value: [ TKey, TObj[TKey] ] ) => readonly unknown[];

export function mapWithKeys<TObj extends Obj>( object: TObj, callback: Callback<TObj> ): object {
	const mapped = Object.entries( object ).map( callback );

	return Object.fromEntries( mapped );
}

export function getDocumentsManager() {
	const documentsManager = ( window as unknown as ExtendedWindow ).elementor.documents;

	if ( ! documentsManager ) {
		throw new Error( 'Elementor Editor V1 documents manager not found' );
	}

	return documentsManager;
}

export function fromV1Document( documentData: V1Document ): Document {
	return {
		id: documentData.id,
		title: documentData.container.settings.get( 'post_title' ),
		status: documentData.container.settings.get( 'post_status' ),
		isModified: documentData.editor.isChanged,
		isSaving: documentData.editor.isSaving,
		isSavingDraft: false, // TODO: Fix.
		lastEdited: 123, // TODO: Fix.
		userCan: {
			publish: documentData.config.user.can_publish,
		},
	};
}

type ExtendedWindow = Window & {
	elementor: {
		documents: {
			documents: Record<string, V1Document>,
			getCurrentId: () => string,
			getCurrent: () => V1Document,
		}
	}
}

type V1Document = {
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
