import { type PanelExtendedWindow } from './types';

export type InsertTarget = {
	containerId: string;
	at: number | undefined;
};

const getElementor = () => ( window as unknown as PanelExtendedWindow ).elementor;

export function resolveInsertTarget(): InsertTarget | null {
	const selected = getSelectedInDocument();

	if ( selected.length > 1 ) {
		return null;
	}

	const [ element ] = selected;

	if ( ! element ) {
		const previewContainer = getElementor()?.getPreviewContainer?.();

		return previewContainer ? { containerId: previewContainer.id, at: undefined } : null;
	}

	if ( element.model.get( 'elType' ) === 'widget' && element.parent ) {
		const index = element.parent.model.get( 'elements' ).findIndex( element.model );

		return { containerId: element.parent.id, at: index === -1 ? undefined : index + 1 };
	}

	return { containerId: element.id, at: undefined };
}

function getSelectedInDocument() {
	const elementor = getElementor();
	const documentElement = elementor?.documents?.getCurrent?.()?.$element?.[ 0 ];

	return ( elementor?.selection?.getElements() ?? [] ).filter( ( { view } ) => {
		const node = view?.$el?.[ 0 ];

		return ! documentElement || ! node || documentElement.contains( node );
	} );
}
