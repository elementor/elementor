import { V1Document } from '@elementor/editor-documents';
import { V1ElementData } from '@elementor/editor-elements';


export function createMockDocumentData( {
	id = 1,
	title = 'Document ' + id,
	status = 'publish',
	type = 'wp-page',
	elements = [],
}: {
	id?: number;
	status?: string;
	title?: string;
	type?: string;
	elements?: V1ElementData[];
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
			elements
		},
		editor: {
			isChanged: false,
			isSaving: false,
		},
		container: {
			settings: makeV1Settings( {
				post_title: title,
			} ),
			view: {
				el: document.createElement( 'div' ),
			},
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
