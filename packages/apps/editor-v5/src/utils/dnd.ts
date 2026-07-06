export const DND_MIME_TYPE = 'application/x-elementor-v5-dnd';

export type CatalogDragPayload = {
	source: 'catalog';
	elType: string;
	widgetType?: string;
	title: string;
};

export type ElementDragPayload = {
	source: 'element';
	id: string;
};

export type DropTargetPayload = {
	parentId: string | null;
	index: number;
};

export type DragPayload = CatalogDragPayload | ElementDragPayload;

export function encodeDragPayload( payload: DragPayload ): string {
	return JSON.stringify( payload );
}

export function decodeDragPayload( value: string ): DragPayload | null {
	try {
		return JSON.parse( value ) as DragPayload;
	} catch {
		return null;
	}
}

export function setDragPayload( dataTransfer: DataTransfer, payload: DragPayload ): void {
	dataTransfer.setData( DND_MIME_TYPE, encodeDragPayload( payload ) );
	dataTransfer.effectAllowed = 'move';
}

export function readDragPayload( dataTransfer: DataTransfer ): DragPayload | null {
	const raw = dataTransfer.getData( DND_MIME_TYPE );

	if ( ! raw ) {
		return null;
	}

	return decodeDragPayload( raw );
}
