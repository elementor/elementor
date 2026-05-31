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

function getEditorPageTitle(): string {
	const settings = getElementor()?.documents?.getCurrent()?.config?.settings;
	const title = ( settings?.settings?.post_title ?? ( settings as Record< string, unknown > | undefined )?.post_title ) as string | undefined;
	return title || 'Untitled';
}

function getElementDisplayName( container: ElementorContainer ): string {
	if ( container.label ) {
		return container.label;
	}
	const widgetType = ( container.model?.attributes?.widgetType ?? container.model?.widgetType ) as string | undefined;
	if ( widgetType ) {
		return widgetType.charAt( 0 ).toUpperCase() + widgetType.slice( 1 ).replace( /-/g, ' ' );
	}
	if ( container.type === 'container' ) {
		return 'Container';
	}
	if ( container.type === 'section' ) {
		return 'Section';
	}
	return `Element ${ container.id }`;
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
	const primaryId = getCurrentSelection()[ 0 ];
	const container = primaryId ? elementor.getContainer( primaryId ) : null;

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
		selectedWidgetType: widgetType,
		selectedElementType: typeof elementType === 'string' ? elementType : 'widget',
	};
}
