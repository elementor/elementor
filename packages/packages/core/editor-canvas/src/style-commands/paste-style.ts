import { type V1Element } from '@elementor/editor-elements';
import {
	__privateListenTo as listenTo,
	blockCommand,
	type CommandEvent,
	commandStartEvent,
} from '@elementor/editor-v1-adapters';

import { undoablePasteElementStyle } from './undoable-actions/paste-element-style';
import { type ContainerArgs, getClipboardElements, hasAtomicWidgets, isAtomicWidget } from './utils';

type PasteStylesCommandArgs = ContainerArgs & {
	storageKey?: string;
};

export function initPasteStyleCommand() {
	const pasteElementStyleCommand = undoablePasteElementStyle();

	blockCommand( {
		command: 'document/elements/paste-style',
		condition: hasAtomicWidgets,
	} );

	listenTo( commandStartEvent( 'document/elements/paste-style' ), ( e ) =>
		pasteStyles( ( e as CommandEvent ).args, pasteElementStyleCommand )
	);
}

function pasteStyles( args: PasteStylesCommandArgs, pasteCallback: ReturnType< typeof undoablePasteElementStyle > ) {
	const { containers = [ args.container ], storageKey } = args;

	const clipboardElements = getClipboardElements( storageKey );
	const [ clipboardElement ] = clipboardElements ?? [];

	if ( ! clipboardElement ) {
		return;
	}

	const elementStyles = clipboardElement.styles;
	const elementStyle = Object.values( elementStyles ?? {} )[ 0 ]; // we currently support only one local style

	if ( ! elementStyle ) {
		return;
	}

	const atomicContainers = containers.filter( isAtomicWidget ) as V1Element[];

	if ( ! atomicContainers.length ) {
		return;
	}

	pasteCallback( { containers: atomicContainers, newStyle: elementStyle } );
}
