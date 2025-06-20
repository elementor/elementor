import { type V1Document } from '../../types';

export function makeDocumentsManager( documentsArray: V1Document[], current = 1, initial = current ) {
	const documents = documentsArray.reduce( ( acc: Record< number, V1Document >, document ) => {
		acc[ document.id ] = document;

		return acc;
	}, {} );

	return {
		documents,
		getCurrentId() {
			return current;
		},
		getInitialId() {
			return initial;
		},
		getCurrent() {
			return this.documents[ this.getCurrentId() ];
		},
		invalidateCache() {},
	};
}

export function makeMockV1Document( {
	id = 1,
	title = 'Document ' + id,
	status = 'publish',
	type = 'wp-page',
}: {
	id?: number;
	status?: string;
	title?: string;
	type?: string;
} = {} ): V1Document {
	return {
		id,
		config: {
			type,
			user: {
				can_publish: true,
			},
			revisions: {
				current_id: id,
			},
			panel: {
				title: type.toUpperCase(),
				allow_adding_widgets: true,
				show_copy_and_share: false,
			},
			status: {
				label: status.toUpperCase(),
				value: status,
			},
			urls: {
				exit_to_dashboard: `https://localhost/wp-admin/post.php?post=${ id }&action=edit`,
				main_dashboard: `https://localhost/wp-admin/`,
				all_post_type: `https://localhost/wp-admin/post.php`,
				permalink: `https://localhost/?p=${ id }`,
			},
		},
		editor: {
			isChanged: false,
			isSaving: false,
		},
		container: {
			settings: makeV1Settings( {
				post_title: title,
			} ),
		},
	};
}

// Mock Backbone's settings model.
function makeV1Settings< T extends object >( settings: T ) {
	return {
		get( key: keyof T ) {
			return settings[ key ];
		},
	} as V1Document[ 'container' ][ 'settings' ];
}
