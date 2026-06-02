import {
	createElementStyle,
	getContainer,
	getElementStyles,
	updateElementSettings,
	updateElementStyle,
} from '@elementor/editor-elements';
import { classesPropTypeUtil } from '@elementor/editor-props';
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
	'update_element',
	'add_classes',
	'remove_classes',
	'trash',
	'restore',
	'delete',
] as const;

const ELEMENT_SCOPED_OPS = new Set< string >( [ 'update_element', 'add_classes', 'remove_classes' ] );

const INSTRUCTIONS = `Build, update, and write content for Elementor v4 pages via the manage-post ability.
- create | update | replace_content | append_content | update_element | add_classes | remove_classes | trash | restore | delete
- elements: plain JSON nodes ({ widget, text?, tag?, url?, css?, classes?, children? })
- widgets: container | div | flexbox | heading | paragraph | button | image | svg
- svg nodes: svg_id (attachment id, validated to be an image/svg+xml file) | svg_url | svg_markup (inline <svg>…</svg>, sanitized + uploaded to the media library on save, deduplicated by content hash); optional link_url / link_target_blank. update_element accepts the same svg_* / link_* patch keys
- dry_run is honored only for create/replace_content/append_content (inline svg_markup is uploaded only on a real save, not on dry_run)
- create / replace_content / append_content return element_index: a { path: id } map of the saved nodes (incl. auto-inserted wrappers) — use those ids with update_element directly, no follow-up get-post
- element-scoped ops (update_element / add_classes / remove_classes) take element_id + small payload; when the targeted post is the one currently open in the editor, the canvas updates surgically with no document reload
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

type ManagePostResponse = {
	success?: boolean;
	operation?: string;
	post_id?: number;
	dry_run?: boolean;
	element_id?: string;
	patched_element?: PatchedElement | null;
	changed_settings_keys?: string[];
	style_id?: string;
	classes?: string[];
};

type PatchedElement = {
	id?: string;
	settings?: Record< string, unknown >;
	styles?: Record< string, StyleEntry >;
};

type StyleEntry = {
	id?: string;
	variants?: StyleVariant[];
};

type StyleVariant = {
	meta?: { breakpoint?: string | null; state?: string | null };
	props?: Record< string, unknown >;
	custom_css?: { raw?: string } | null;
};

type ManagePostInput = {
	operation: ( typeof OPERATIONS )[ number ];
	element_id?: string;
	patched_element?: PatchedElement;
};

function applySurgicalCanvasUpdate( input: ManagePostInput, data: ManagePostResponse ): boolean {
	const elementId = input.element_id;
	if ( ! elementId ) {
		return false;
	}

	try {
		const container = getContainer( elementId );
		if ( ! container ) {
			return false;
		}

		const patched = data.patched_element;

		if ( input.operation === 'update_element' ) {
			return applyUpdateElement( elementId, patched, data );
		}

		if ( input.operation === 'add_classes' || input.operation === 'remove_classes' ) {
			return applyClassesReplace( elementId, data.classes );
		}

		return false;
	} catch {
		return false;
	}
}

function applyUpdateElement( elementId: string, patched: PatchedElement | null | undefined, data: ManagePostResponse ): boolean {
	const changedKeys = Array.isArray( data.changed_settings_keys ) ? data.changed_settings_keys : [];
	const styleId = typeof data.style_id === 'string' ? data.style_id : null;

	if ( changedKeys.length === 0 && ! styleId ) {
		return false;
	}

	if ( changedKeys.length > 0 && patched?.settings ) {
		const props: Record< string, unknown > = {};
		for ( const key of changedKeys ) {
			if ( key in patched.settings ) {
				props[ key ] = patched.settings[ key ];
			}
		}
		if ( Object.keys( props ).length > 0 ) {
			updateElementSettings( {
				id: elementId,
				props: props as Parameters< typeof updateElementSettings >[ 0 ][ 'props' ],
				withHistory: true,
			} );
		}
	}

	if ( styleId && patched?.styles ) {
		const entry = patched.styles[ styleId ];
		const variant = entry?.variants?.[ 0 ];
		if ( ! variant ) {
			return false;
		}

		const meta = {
			breakpoint: variant.meta?.breakpoint ?? 'desktop',
			state: ( variant.meta?.state ?? null ) as null,
		};
		const props = ( variant.props ?? {} ) as Parameters< typeof updateElementStyle >[ 0 ][ 'props' ];
		const customCss = variant.custom_css ?? null;

		const existingStyles = getElementStyles( elementId );
		const styleExists = !! existingStyles?.[ styleId ];

		if ( styleExists ) {
			updateElementStyle( {
				elementId,
				styleId,
				meta: meta as Parameters< typeof updateElementStyle >[ 0 ][ 'meta' ],
				props,
				custom_css: customCss as Parameters< typeof updateElementStyle >[ 0 ][ 'custom_css' ],
			} );
		} else {
			createElementStyle( {
				styleId,
				elementId,
				classesProp: 'classes',
				label: 'local',
				meta: meta as Parameters< typeof createElementStyle >[ 0 ][ 'meta' ],
				props,
				custom_css: customCss as Parameters< typeof createElementStyle >[ 0 ][ 'custom_css' ],
			} );
		}
	}

	return true;
}

function applyClassesReplace( elementId: string, classes: string[] | undefined ): boolean {
	if ( ! Array.isArray( classes ) ) {
		return false;
	}

	updateElementSettings( {
		id: elementId,
		props: { classes: classesPropTypeUtil.create( classes ) },
		withHistory: true,
	} );

	return true;
}

export function initManagePostMcp(): void {
	if ( ! isExperimentActive( ABILITIES_EXPERIMENT ) ) {
		return;
	}

	const reg = getMCPByDomain( 'manage_post', { instructions: INSTRUCTIONS } );

	reg.addTool( {
		name: 'manage-post',
		description:
			'Create, update, trash, restore, delete, or write content for an Elementor v4 post. Pass elements as plain JSON nodes: { widget, text?, tag?, url?, css?, classes?, children? }. Root-level widgets without a container parent are auto-wrapped in an e-div-block. For per-element changes prefer update_element (patch one node by id), add_classes, or remove_classes — cheaper than resending the whole tree, and when the targeted post is the one open in the editor the canvas updates surgically without a document reload.',
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
			element_id: z
				.string()
				.optional()
				.describe( 'Required for update_element / add_classes / remove_classes. Id of the element to patch.' ),
			patch: z
				.object( {
					text: z.string().optional(),
					tag: z.string().optional(),
					url: z.string().optional(),
					target_blank: z.boolean().optional(),
					css: z.union( [ z.string(), z.record( z.string() ) ] ).optional(),
					classes: z.array( z.string() ).optional(),
				} )
				.optional()
				.describe(
					'Surgical patch for update_element. Fields not listed are left untouched ($set semantics). css can be a declaration string OR an object; merges into the existing local style variant. classes here REPLACES the element\'s class list — use add_classes / remove_classes for union/filter semantics.'
				),
			classes: z
				.array( z.string() )
				.optional()
				.describe(
					'Required for add_classes / remove_classes. Array of global class ids. The local-style class e-<id>-s is always preserved on remove.'
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
			const { data } = await callWpApi< ManagePostResponse >(
				ABILITY_ENDPOINT,
				'POST',
				{ input }
			);

			const isDryRun = Boolean( data?.dry_run );
			const responsePostId = typeof data?.post_id === 'number' ? data.post_id : null;
			const currentDocumentId = getCurrentEditorDocumentId();
			const targetsOpenDocument =
				! isDryRun &&
				responsePostId !== null &&
				currentDocumentId !== null &&
				responsePostId === currentDocumentId;

			if ( targetsOpenDocument ) {
				const operation = input.operation as string;
				if ( ELEMENT_SCOPED_OPS.has( operation ) ) {
					const applied = applySurgicalCanvasUpdate( input as ManagePostInput, data );
					if ( ! applied ) {
						refreshCurrentDocument( responsePostId as number );
					}
				} else {
					refreshCurrentDocument( responsePostId as number );
				}
			}

			return data;
		},
	} );
}
