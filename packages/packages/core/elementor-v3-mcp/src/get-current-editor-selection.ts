import type { ElementorContainer } from './types';
import { getCurrentSelection, getElementor } from './utils';

export type EditorSelectionSnapshot = {
	displayName: string;
	documentId: string | number;
	pageTitle: string;
	selectedElementId: string | null;
	selectedParentId: string | null;
	selectedWidgetType: string | null;
	selectedElementType: string | null;
};

type ContainerWithLabel = ElementorContainer & {
	label?: string;
	type?: string;
	model: ElementorContainer[ 'model' ] & { widgetType?: string };
};

function getEditorPageTitle(): string {
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
		return attrWidgetType.charAt( 0 ).toUpperCase() + attrWidgetType.slice( 1 ).replace( /-/g, ' ' );
	}
	const modelWidgetType = container.model?.widgetType;
	if ( modelWidgetType ) {
		return modelWidgetType.charAt( 0 ).toUpperCase() + modelWidgetType.slice( 1 ).replace( /-/g, ' ' );
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
	const primaryId = getCurrentSelection()[ 0 ];
	if ( ! primaryId || ! elementor?.getContainer ) {
		return null;
	}
	return elementor.getContainer( primaryId ) as ContainerWithLabel | null;
}

export function getCurrentEditorSelection(): { error: string } | EditorSelectionSnapshot {
	const elementor = getElementor();
	if ( ! elementor?.documents?.getCurrent ) {
		return { error: 'Elementor is not available' };
	}

	const document = elementor.documents.getCurrent();
	if ( ! document ) {
		return { error: 'No active document found' };
	}

	const pageTitle = getEditorPageTitle();
	const container = primarySelectedContainer();

	if ( ! container?.id ) {
		return {
			displayName: pageTitle,
			documentId: document.id,
			pageTitle,
			selectedElementId: null,
			selectedParentId: null,
			selectedWidgetType: null,
			selectedElementType: null,
		};
	}

	const widgetType = ( container.model?.attributes?.widgetType as string ) ?? null;
	const elementType = container.type ?? ( container.model?.attributes?.elType as string ) ?? 'widget';

	return {
		displayName: `${ pageTitle } > ${ getElementDisplayName( container ) }`,
		documentId: document.id,
		pageTitle,
		selectedElementId: container.id,
		selectedParentId: container.parent?.id ?? null,
		selectedWidgetType: typeof widgetType === 'string' ? widgetType : null,
		selectedElementType: typeof elementType === 'string' ? elementType : 'widget',
	};
}
