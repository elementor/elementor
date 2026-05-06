import { z } from '@elementor/schema';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { V3_DESCRIPTION_URI } from '../mcp-description-resource';
import { RESOURCE_URI_PAGE_SETTINGS } from '../resources';
import type { ElementorContainer, McpToolResult, ToolParams } from '../types';
import { encodeToolJson, get$e, getElementor } from '../utils';
import { validateDocumentSettingsUpdated } from '../validation-helpers';

export function addPageTool( server: McpServer ): void {
	server.registerTool(
		'page',
		{
			description: `Manage page and document operations: history, save, settings, and open/preview.`,
			inputSchema: {
				action: z
					.enum( [
						'save-draft',
						'save-publish',
						'save-update',
						'save-discard',
						'history-undo',
						'history-redo',
						'history-undo-all',
						'get-settings',
						'update-settings',
						'open',
						'preview',
					] )
					.describe(
						'The page operation to perform: history-undo (revert the last change - use when user says "undo"), history-redo (reapply last undone change - use when user says "redo"), history-undo-all (revert all changes), save-draft (save as draft), save-publish (publish page), save-update (update published page), save-discard (discard unsaved changes), get-settings (retrieve page settings), update-settings (modify page settings), open (open a different page), preview (preview the page)'
					),
				pageId: z.string().optional().describe( 'Page/document ID for open action' ),
				settings: z
					.record( z.unknown() )
					.optional()
					.describe(
						'Settings object containing the specific page settings you want to update. REQUIRED for update-settings action. Only include settings you want to change, not all settings. Example: {"hide_title": "yes", "template": "elementor_canvas"}.'
					),
			},
			annotations: {
				title: 'Manage Page',
			},
			_meta: {
				'angie/requiredResources': [
					{
						uri: V3_DESCRIPTION_URI,
						whenToUse: 'Read to understand Elementor capabilities and limitations before using this tool.',
					},
					{
						uri: RESOURCE_URI_PAGE_SETTINGS,
						whenToUse:
							'When updating page settings (action=update-settings) to understand the page schema, available settings, their allowed values, and current page configuration',
					},
				],
			},
		},
		async ( params: ToolParams ) => {
			switch ( params.action ) {
				case 'save-draft':
					return await handleSavePageDraft();
				case 'save-publish':
					return await handleSavePagePublish();
				case 'save-update':
					return await handleSavePageUpdate();
				case 'save-discard':
					return await handleSavePageDiscard();
				case 'history-undo':
					return await handleHistoryUndo();
				case 'history-redo':
					return await handleHistoryRedo();
				case 'history-undo-all':
					return await handleHistoryUndoAll();
				case 'get-settings':
					return await handleGetDocumentSettings();
				case 'update-settings':
					return await handleUpdateDocumentSettings( params );
				case 'open':
					return await handleOpenPage( params );
				case 'preview':
					return await handlePreviewPage();
				default:
					throw new Error( `Unknown action: ${ params.action }` );
			}
		}
	);
}

async function handleSavePageDraft(): Promise< McpToolResult > {
	await get$e()?.run( 'document/save/draft' );
	return {
		content: [ { type: 'text', text: 'Page saved as draft.' } ],
	};
}

async function handleSavePagePublish(): Promise< McpToolResult > {
	await get$e()?.run( 'document/save/publish' );
	return {
		content: [ { type: 'text', text: 'Page published.' } ],
	};
}

async function handleSavePageUpdate(): Promise< McpToolResult > {
	await get$e()?.run( 'document/save/update' );
	return {
		content: [ { type: 'text', text: 'Page updated.' } ],
	};
}

async function handleSavePageDiscard(): Promise< McpToolResult > {
	await get$e()?.run( 'document/save/discard' );
	return {
		content: [ { type: 'text', text: 'Page changes discarded.' } ],
	};
}

async function handleHistoryUndo(): Promise< McpToolResult > {
	await get$e()?.run( 'document/history/undo' );
	return {
		content: [ { type: 'text', text: 'Undo performed.' } ],
	};
}

async function handleHistoryRedo(): Promise< McpToolResult > {
	await get$e()?.run( 'document/history/redo' );
	return {
		content: [ { type: 'text', text: 'Redo performed.' } ],
	};
}

async function handleHistoryUndoAll(): Promise< McpToolResult > {
	await get$e()?.run( 'document/history/undo-all', { document: getElementor()?.documents.getCurrent() } );
	return {
		content: [ { type: 'text', text: 'All changes undone.' } ],
	};
}

async function handleOpenPage( params: ToolParams ): Promise< McpToolResult > {
	if ( ! params.pageId ) {
		throw new Error( 'pageId is required for open action' );
	}

	await get$e()?.run( 'editor/documents/open', {
		id: params.pageId,
	} );

	return {
		content: [ { type: 'text', text: `Page ${ params.pageId } opened.` } ],
	};
}

async function handlePreviewPage(): Promise< McpToolResult > {
	await get$e()?.run( 'editor/documents/preview' );
	return {
		content: [ { type: 'text', text: 'Page preview opened.' } ],
	};
}

async function handleGetDocumentSettings(): Promise< McpToolResult > {
	const document = getElementor()?.documents?.getCurrent();
	if ( ! document ) {
		throw new Error( 'No active document found.' );
	}

	const settings = document.config?.settings || {};

	return {
		content: [
			{
				type: 'text',
				text: encodeToolJson( {
					documentId: document.id,
					documentType: document.config?.type,
					settings,
				} ),
			},
		],
	};
}

async function handleUpdateDocumentSettings( params: ToolParams ): Promise< McpToolResult > {
	const currentDocument = getElementor()?.documents?.getCurrent();
	if ( ! currentDocument ) {
		throw new Error( 'No active document found.' );
	}

	if ( ! params.settings || typeof params.settings !== 'object' ) {
		throw new Error( 'settings object is required for update-settings action' );
	}

	await get$e()?.run( 'document/elements/settings', {
		container: currentDocument.container,
		settings: params.settings,
		options: {
			external: true,
		},
	} );

	const updatedDocument = getElementor()?.documents?.getCurrent();
	if ( ! updatedDocument?.container ) {
		throw new Error( 'Document container not found after update' );
	}
	validateDocumentSettingsUpdated( updatedDocument.container as unknown as ElementorContainer );

	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify( {
					success: true,
					message: `Document settings updated successfully. Settings: ${ JSON.stringify(
						params.settings,
						null,
						2
					) }`,
					saveChangesSuggestion: 'Suggest the following quick user replies: "Publish Changes", "Save Draft"',
					nextStep: 'Page settings updated in editor. User should save the page to persist changes.',
				} ),
			},
		],
	};
}
