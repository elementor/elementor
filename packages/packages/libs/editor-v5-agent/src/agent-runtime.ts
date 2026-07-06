import {
	createElement,
	type DocumentSliceState,
	getAtomicCatalog,
	getAtomicWidgetConfig,
	getElementById,
	hydrate,
	markSaved,
	moveElement,
	removeElement,
	select,
	updateSetting,
} from '@elementor/editor-v5-store';
import { type __createStore } from '@elementor/store';

import { TypedEventEmitter } from './events';
import { AGENT_TOOLS, getToolByName } from './tools';
import type { AgentEvent, AgentSnapshot, AgentTool } from './types';

type SaveDocumentFn = ( status?: string ) => Promise< unknown >;

type AgentRuntimeOptions = {
	saveDocument?: SaveDocumentFn;
};

type EditorV5Store = ReturnType< typeof __createStore > & {
	getState: () => DocumentSliceState;
};

export class AgentRuntime {
	private readonly events = new TypedEventEmitter();

	private readonly saveDocumentFn?: SaveDocumentFn;

	constructor(
		private readonly store: EditorV5Store,
		options: AgentRuntimeOptions = {}
	) {
		this.saveDocumentFn = options.saveDocument;
		this.subscribeToDocumentChanges();
	}

	private subscribeToDocumentChanges(): void {
		let previousSnapshot = JSON.stringify( this.getSnapshot().elements );

		this.store.subscribe( () => {
			const nextSnapshot = JSON.stringify( this.getSnapshot().elements );

			if ( nextSnapshot === previousSnapshot ) {
				return;
			}

			previousSnapshot = nextSnapshot;

			this.events.emit( {
				type: 'document.changed',
				payload: this.getSnapshot(),
				timestamp: Date.now(),
			} );
		} );
	}

	listTools(): AgentTool[] {
		return AGENT_TOOLS;
	}

	on( eventType: string, listener: ( event: AgentEvent ) => void ): () => void {
		return this.events.on( eventType, listener );
	}

	getSnapshot(): AgentSnapshot {
		const document = this.store.getState().editorV5Document;

		return {
			document,
			elements: document.elements,
			selectedIds: document.selectedIds,
		};
	}

	async callTool( name: string, input: Record< string, unknown > = {} ): Promise< unknown > {
		const tool = getToolByName( name );

		if ( ! tool ) {
			throw new Error( `Unknown tool: ${ name }` );
		}

		this.events.emit( {
			type: 'tool:call',
			tool: name,
			payload: input,
			timestamp: Date.now(),
		} );

		let result: unknown;

		switch ( name ) {
			case 'getSnapshot':
				result = this.getSnapshot();
				break;
			case 'listElements':
				result = this.getSnapshot().elements;
				break;
			case 'getElement':
				result = getElementById( this.getSnapshot().elements, String( input.id ) );
				break;
			case 'listWidgets':
				result = getAtomicCatalog();
				break;
			case 'getWidgetSchema':
				result = getAtomicWidgetConfig( String( input.name ) )?.atomic_props_schema ?? null;
				break;
			case 'createElement':
				this.store.dispatch(
					createElement( {
						parentId: input.parentId as string | null | undefined,
						elType: String( input.elType ),
						widgetType: input.widgetType as string | undefined,
						settings: input.settings as Record< string, unknown > | undefined,
						index: typeof input.index === 'number' ? input.index : undefined,
					} )
				);
				result = this.getSnapshot();
				break;
			case 'updateSetting':
				this.store.dispatch(
					updateSetting( {
						id: String( input.id ),
						key: String( input.key ),
						value: input.value,
					} )
				);
				result = getElementById( this.getSnapshot().elements, String( input.id ) );
				break;
			case 'selectElement':
				this.store.dispatch(
					select( {
						ids: ( input.ids as string[] ) ?? [],
					} )
				);
				result = this.getSnapshot().selectedIds;
				break;
			case 'removeElement':
				this.store.dispatch( removeElement( { id: String( input.id ) } ) );
				result = this.getSnapshot();
				break;
			case 'moveElement':
				this.store.dispatch(
					moveElement( {
						id: String( input.id ),
						parentId: ( input.parentId as string | null | undefined ) ?? null,
						index: Number( input.index ),
					} )
				);
				result = this.getSnapshot();
				break;
			case 'saveDocument':
				if ( ! this.saveDocumentFn ) {
					throw new Error( 'saveDocument is not configured.' );
				}
				result = await this.saveDocumentFn( input.status as string | undefined );
				this.store.dispatch( markSaved() );
				break;
			default:
				throw new Error( `Tool not implemented: ${ name }` );
		}

		this.events.emit( {
			type: 'tool:result',
			tool: name,
			payload: result,
			timestamp: Date.now(),
		} );

		return result;
	}
}

export function createAgentRuntime( store: EditorV5Store, options?: AgentRuntimeOptions ): AgentRuntime {
	return new AgentRuntime( store, options );
}

export { hydrate };
