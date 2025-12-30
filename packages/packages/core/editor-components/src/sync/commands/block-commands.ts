import { blockCommand } from '@elementor/editor-v1-adapters';

import { blockCircularCreate, blockCircularMove, blockCircularPaste } from './prevent-circular-nesting';
import {
	blockCreateInNonEditableComponent,
	blockMoveToNonEditableComponent,
	blockPasteToNonEditableComponent,
} from './prevent-non-editable-component';
import { type CreateArgs, type MoveArgs, type PasteArgs } from './types';

function blockCreate( args: CreateArgs ): boolean {
	return [ blockCreateInNonEditableComponent, blockCircularCreate ].some( ( condition ) => condition( args ) );
}

function blockMove( args: MoveArgs ): boolean {
	return [ blockMoveToNonEditableComponent, blockCircularMove ].some( ( condition ) => condition( args ) );
}

function blockPaste( args: PasteArgs ): boolean {
	return [ blockPasteToNonEditableComponent, blockCircularPaste ].some( ( condition ) => condition( args ) );
}

export function initBlockCommands() {
	blockCommand( { command: 'document/elements/create', condition: blockCreate } );
	blockCommand( { command: 'document/elements/move', condition: blockMove } );
	blockCommand( { command: 'document/elements/paste', condition: blockPaste } );
}
