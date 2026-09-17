import type { ElementorContainer } from './types';
import { getCurrentSelection, getElementor } from './utils';

export type EditorSelectionSnapshot = {
	displayName: string;
	documentId: string;
	pageTitle: string;
	selectedElementId: string | null;
	selectedParentId: string | null;
	selectedWidgetType: string | null;
	selectedElementType: string | null;
};

const ELEMENT_TYPE_LABELS: Partial< Record< string, string > > = {
	container: 'Container',
	section: 'Section',
};

function getEditorPageTitle(): string {
	const title = getElementor()?.documents?.getCurrent()?.config?.settings?.settings?.post_title as string | undefined;
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
	return ELEMENT_TYPE_LABELS[ container.type ?? '' ] ?? `Element ${ container.id }`;
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

	const base: EditorSelectionSnapshot = {
		displayName: pageTitle,
		documentId: document.id,
		pageTitle,
		selectedElementId: null,
		selectedParentId: null,
		selectedWidgetType: null,
		selectedElementType: null,
	};

	if ( ! container?.id ) {
		return base;
	}

	const widgetType = ( container.model?.attributes?.widgetType as string ) ?? null;
	const elementType = container.type ?? ( container.model?.attributes?.elType as string ) ?? 'widget';

	return {
		...base,
		displayName: `${ pageTitle } > ${ getElementDisplayName( container ) }`,
		selectedElementId: container.id,
		selectedParentId: container.parent?.id ?? null,
		selectedWidgetType: widgetType,
		selectedElementType: elementType,
	};
}
