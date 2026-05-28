import { __privateRunCommand as runCommand, isExperimentActive } from '@elementor/editor-v1-adapters';
import { callWpApi } from '@elementor/elementor-mcp-common';
import { z } from '@elementor/schema';

import { getMCPByDomain } from './mcp-registry';

const ABILITIES_EXPERIMENT = 'e_wp_abilities_api';
const ABILITY_ENDPOINT = '/wp-abilities/v1/abilities/elementor/manage-post/run';

const OPERATIONS = [
	'create',
	'update',
	'replace_content',
	'append_content',
	'trash',
	'restore',
	'delete',
] as const;

const INSTRUCTIONS = `Build, update, and write content for Elementor v4 pages via the manage-post ability.
- create | update | replace_content | append_content | trash | restore | delete
- elements: plain JSON nodes ({ widget, text?, tag?, url?, css?, classes?, children? })
- dry_run is honored only for create/replace_content/append_content
- after a successful write to the post that is currently open in the editor, the canvas is reloaded automatically
`;

type ElementorWindow = Window & {
	elementor?: {
		documents?: {
			getCurrent?: () => { id?: number } | undefined;
			invalidateCache?: ( id?: number ) => void;
		};
	};
};

function getCurrentEditorDocumentId(): number | null {
	const w = window as ElementorWindow;
	const id = w.elementor?.documents?.getCurrent?.()?.id;
	return typeof id === 'number' && id > 0 ? id : null;
}

function refreshCurrentDocument( postId: number ): void {
	const w = window as ElementorWindow;
	try {
		w.elementor?.documents?.invalidateCache?.( postId );
		runCommand( 'editor/documents/switch', { id: postId } );
	} catch {
		// best-effort refresh — falls back silently if the editor isn't ready
	}
}

export function initManagePostMcp(): void {
	if ( ! isExperimentActive( ABILITIES_EXPERIMENT ) ) {
		return;
	}

	const reg = getMCPByDomain( 'manage_post', { instructions: INSTRUCTIONS } );

	reg.addTool( {
		name: 'manage-post',
		description:
			'Create, update, trash, restore, delete, or write content for an Elementor v4 post in a single call. Pass elements as plain JSON nodes: { widget, text?, tag?, url?, css?, classes?, children? }. Root-level widgets without a container parent are auto-wrapped in an e-div-block. When the targeted post is the one currently open in the editor, the canvas is reloaded automatically so the user sees the change without refreshing the page.',
		schema: {
			operation: z.enum( OPERATIONS ).describe( 'Which lifecycle action to take.' ),
			post_id: z
				.number()
				.optional()
				.describe( 'Target post. Required for every operation except create.' ),
			title: z.string().optional().describe( 'Post title. Required for create.' ),
			post_type: z
				.string()
				.optional()
				.describe( 'Post type slug. Only honored on create. Default: page.' ),
			post_status: z
				.string()
				.optional()
				.describe( 'draft | publish | private. Default on create: draft.' ),
			slug: z.string().optional().describe( 'Post name; WordPress sanitizes and de-duplicates.' ),
			post_template: z
				.string()
				.optional()
				.describe(
					'Page template slug. New-post default: elementor_canvas. Pass an empty string to use the theme default.'
				),
			elements: z
				.array( z.unknown() )
				.optional()
				.describe(
					'Plain JSON nodes. Required for replace_content/append_content; optional on create.'
				),
			dry_run: z
				.boolean()
				.optional()
				.describe(
					'When true, validate without saving. Only honored for create/replace_content/append_content.'
				),
		},
		isDestructive: true,
		handler: async ( input ) => {
			const { data } = await callWpApi< Record< string, unknown > >(
				ABILITY_ENDPOINT,
				'POST',
				{ input }
			);

			const isDryRun = Boolean( data?.dry_run );
			const responsePostId = typeof data?.post_id === 'number' ? data.post_id : null;
			const currentDocumentId = getCurrentEditorDocumentId();

			if (
				! isDryRun &&
				responsePostId !== null &&
				currentDocumentId !== null &&
				responsePostId === currentDocumentId
			) {
				refreshCurrentDocument( responsePostId );
			}

			return data;
		},
	} );
}
