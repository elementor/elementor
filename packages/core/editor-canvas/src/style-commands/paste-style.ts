import { getContainer, getElementSetting, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { type StyleDefinition } from '@elementor/editor-styles';
import {
	__privateListenTo as listenTo,
	blockCommand,
	type CommandEvent,
	commandStartEvent,
} from '@elementor/editor-v1-adapters';

import { undoablePasteElementStyle } from './undoable-actions/paste-element-style';
import { type ContainerArgs, getClassesProp, getClipboardElements, hasAtomicWidgets, isAtomicWidget } from './utils';

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

function pasteStyles( args: PasteStylesCommandArgs, pasteLocalStyle: ReturnType< typeof undoablePasteElementStyle > ) {
	const { containers = [ args.container ], storageKey } = args;

	const atomicContainers = containers.filter( isAtomicWidget ) as V1Element[];

	if ( ! atomicContainers.length ) {
		return;
	}

	const clipboardElements = getClipboardElements( storageKey );
	const [ clipboardElement ] = clipboardElements ?? [];

	const clipboardContainer = getContainer( clipboardElement.id );
	if ( ! clipboardElement || ! clipboardContainer || ! isAtomicWidget( clipboardContainer ) ) {
		return;
	}

	const elementStyles = clipboardElement.styles;
	const elementStyle = Object.values( elementStyles ?? {} )[ 0 ]; // we currently support only one local style

	const classesSetting = getClassesWithoutLocalStyle( clipboardContainer, elementStyle );
	if ( classesSetting.length ) {
		pasteClasses( atomicContainers, classesSetting );
	}

	if ( elementStyle ) {
		pasteLocalStyle( { containers: atomicContainers, newStyle: elementStyle } );
	}
}

function getClassesWithoutLocalStyle( clipboardContainer: V1Element, style: StyleDefinition | null ): string[] {
	const classesProp = getClassesProp( clipboardContainer );

	if ( ! classesProp ) {
		return [];
	}

	const classesSetting = getElementSetting< ClassesPropValue >( clipboardContainer.id, classesProp );

	return classesSetting?.value.filter( ( styleId ) => styleId !== style?.id ) ?? [];
}

function pasteClasses( containers: V1Element[], classes: string[] ) {
	containers.forEach( ( container ) => {
		const classesProp = getClassesProp( container );
		if ( ! classesProp ) {
			return;
		}

		const classesSetting = getElementSetting< ClassesPropValue >( container.id, classesProp );
		const currentClasses = classesPropTypeUtil.extract( classesSetting ) ?? [];

		const newClasses = classesPropTypeUtil.create( Array.from( new Set( [ ...classes, ...currentClasses ] ) ) );

		updateElementSettings( {
			id: container.id,
			props: { [ classesProp ]: newClasses },
		} );
	} );
}
