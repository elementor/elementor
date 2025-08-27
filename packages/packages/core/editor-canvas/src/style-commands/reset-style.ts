import { type V1Element } from '@elementor/editor-elements';
import {
	__privateListenTo as listenTo,
	blockCommand,
	type CommandEvent,
	commandStartEvent,
} from '@elementor/editor-v1-adapters';

import { undoableResetElementStyle } from './undoable-actions/reset-element-style';
import { type ContainerArgs, hasAtomicWidgets, isAtomicWidget } from './utils';

export function initResetStyleCommand() {
	const resetElementStyles = undoableResetElementStyle();

	blockCommand( {
		command: 'document/elements/reset-style',
		condition: hasAtomicWidgets,
	} );

	listenTo( commandStartEvent( 'document/elements/reset-style' ), ( e ) =>
		resetStyles( ( e as CommandEvent ).args, resetElementStyles )
	);
}

function resetStyles( args: ContainerArgs, resetElementStyles: ReturnType< typeof undoableResetElementStyle > ) {
	const { containers = [ args.container ] } = args;
	const atomicContainers = containers.filter( isAtomicWidget ) as V1Element[];

	if ( ! atomicContainers.length ) {
		return;
	}

	resetElementStyles( { containers: atomicContainers } );
}
