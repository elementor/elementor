import * as React from 'react';
import { useMemo } from 'react';
import { createElement, getAtomicCatalog, getPreferredParentId, isContainerElement } from '@elementor/editor-v5-store';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import { Box, Chip, List, ListItemButton, ListItemText, Stack, Typography } from '@elementor/ui';

import { type CatalogDragPayload, setDragPayload } from '../utils/dnd';
import PanelChrome from './panel-chrome';

type CatalogItemShape = {
	elType: string;
	name: string;
	title: string;
	widgetType?: string;
};

function toCatalogItem( widget: ReturnType< typeof getAtomicCatalog >[ number ] ): CatalogItemShape {
	const isWidget = widget.elType === 'widget';

	return {
		elType: isWidget ? 'widget' : widget.name,
		name: widget.name,
		title: widget.title || widget.name,
		widgetType: isWidget ? widget.name : undefined,
	};
}

function DraggableCatalogItem( { item, onAdd }: { item: CatalogItemShape; onAdd: () => void } ) {
	const handleDragStart = ( event: React.DragEvent ) => {
		const payload: CatalogDragPayload = {
			source: 'catalog',
			elType: item.elType,
			title: item.title,
			widgetType: item.widgetType,
		};

		setDragPayload( event.dataTransfer, payload );
	};

	return (
		<ListItemButton draggable onClick={ onAdd } onDragStart={ handleDragStart } sx={ { borderRadius: 1 } }>
			<ListItemText
				primary={ item.title }
				secondary="Drag to canvas"
				primaryTypographyProps={ { fontWeight: 500, variant: 'body2' } }
				secondaryTypographyProps={ { variant: 'caption' } }
			/>
		</ListItemButton>
	);
}

export default function ElementsPanel() {
	const widgets = useMemo( () => getAtomicCatalog().map( toCatalogItem ), [] );
	const selectedIds = useSelector(
		( state: { editorV5Document: { selectedIds: string[] } } ) => state.editorV5Document.selectedIds
	);
	const elements = useSelector(
		( state: { editorV5Document: { elements: unknown[] } } ) => state.editorV5Document.elements
	);
	const insertionParentId = useMemo(
		() => getPreferredParentId( elements as never, selectedIds ),
		[ elements, selectedIds ]
	);

	const containers = widgets.filter( ( item ) =>
		isContainerElement( {
			elType: item.elType,
			id: '',
			settings: {},
			elements: [],
			widgetType: item.widgetType,
		} )
	);
	const leafElements = widgets.filter(
		( item ) =>
			! isContainerElement( {
				elType: item.elType,
				id: '',
				settings: {},
				elements: [],
				widgetType: item.widgetType,
			} )
	);

	const handleAdd = ( item: CatalogItemShape ) => {
		dispatch(
			createElement( {
				elType: item.elType,
				parentId: insertionParentId,
				widgetType: item.widgetType,
			} )
		);
	};

	return (
		<PanelChrome
			subtitle={ insertionParentId ? 'Adding inside selected container' : 'Adding to page root' }
			title="Elements"
		>
			<Stack spacing={ 2 } sx={ { p: 1.5 } }>
				<Box sx={ { px: 0.5 } }>
					<Chip
						color={ insertionParentId ? 'primary' : 'default' }
						label={ insertionParentId ? 'Nested insert' : 'Root insert' }
						size="small"
						variant={ insertionParentId ? 'filled' : 'outlined' }
					/>
				</Box>
				<Box>
					<Chip label="Containers" size="small" sx={ { mb: 1 } } />
					<List dense disablePadding>
						{ containers.map( ( item ) => (
							<DraggableCatalogItem key={ item.name } item={ item } onAdd={ () => handleAdd( item ) } />
						) ) }
					</List>
				</Box>
				<Box>
					<Chip label="Widgets" size="small" sx={ { mb: 1 } } />
					<List dense disablePadding>
						{ leafElements.map( ( item ) => (
							<DraggableCatalogItem key={ item.name } item={ item } onAdd={ () => handleAdd( item ) } />
						) ) }
					</List>
				</Box>
				{ ! widgets.length && (
					<Typography color="text.secondary" sx={ { px: 1 } } variant="body2">
						No atomic widgets found in editor config.
					</Typography>
				) }
			</Stack>
		</PanelChrome>
	);
}
