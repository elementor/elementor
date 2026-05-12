import type { ElementorContainer } from './types';
import { getElementor } from './utils';

export type EditorSelectionSnapshot = {
	displayName: string;
};

type ContainerWithLabel = ElementorContainer & {
	label?: string;
	type?: string;
	model: ElementorContainer[ 'model' ] & { widgetType?: string };
};

function selectionElementIds(): string[] {
	const elementor = getElementor();
	if ( ! elementor?.selection?.elements ) {
		return [];
	}
	return Object.keys( elementor.selection.elements );
}

function getEditorPageTitleFromDocument(): string {
	const document = getElementor()?.documents?.getCurrent();
	if ( ! document ) {
		return 'Untitled';
	}
	const fromNested = document.config?.settings?.settings?.post_title;
	if ( typeof fromNested === 'string' && fromNested ) {
		return fromNested;
	}
	const legacy = ( document.config?.settings as Record< string, unknown > | undefined )?.post_title;
	if ( typeof legacy === 'string' && legacy ) {
		return legacy;
	}
	return 'Untitled';
}

function getElementDisplayName( container: ContainerWithLabel ): string {
	if ( container.label ) {
		return container.label;
	}
	const attrWidgetType = container.model?.attributes?.widgetType;
	if ( typeof attrWidgetType === 'string' && attrWidgetType ) {
		const capitalized = attrWidgetType.charAt( 0 ).toUpperCase() + attrWidgetType.slice( 1 );
		return capitalized.replace( /-/g, ' ' );
	}
	const modelWidgetType = container.model?.widgetType;
	if ( modelWidgetType ) {
		const capitalized = modelWidgetType.charAt( 0 ).toUpperCase() + modelWidgetType.slice( 1 );
		return capitalized.replace( /-/g, ' ' );
	}
	if ( container.type === 'container' ) {
		return 'Container';
	}
	if ( container.type === 'section' ) {
		return 'Section';
	}
	return `Element ${ container.id }`;
}

function primarySelectedContainer(): ContainerWithLabel | null {
	const elementor = getElementor();
	const primaryId = selectionElementIds()[ 0 ];
	if ( ! primaryId || ! elementor?.getContainer ) {
		return null;
	}
	return elementor.getContainer( primaryId ) as ContainerWithLabel | null;
}

// Builds the "Working on:" label shown in the Angie chat input.
// Format: "<PageTitle>" when nothing is selected, "<PageTitle> > <ElementName>" otherwise.
export function getCurrentEditorSelection(): { error: string } | EditorSelectionSnapshot {
	const elementor = getElementor();
	if ( ! elementor?.documents?.getCurrent ) {
		return { error: 'Elementor is not available' };
	}

	const document = elementor.documents.getCurrent();
	if ( ! document ) {
		return { error: 'No active document found' };
	}

	const pageTitle = getEditorPageTitleFromDocument();
	const container = primarySelectedContainer();

	if ( ! container?.id ) {
		return { displayName: pageTitle };
	}

	return { displayName: `${ pageTitle } > ${ getElementDisplayName( container ) }` };
}
