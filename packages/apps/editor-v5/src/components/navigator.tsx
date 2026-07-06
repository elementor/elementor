import * as React from 'react';
import { useState } from 'react';
import { type ElementNode, getElementLabel, moveElement, select } from '@elementor/editor-v5-store';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import { List, ListItemButton, ListItemText } from '@elementor/ui';

import { type ElementDragPayload, readDragPayload, setDragPayload } from '../utils/dnd';
import PanelChrome from './panel-chrome';

type NavigatorItemProps = {
	activeDropId: string | null;
	depth: number;
	element: ElementNode;
	onActivateDrop: ( dropId: string | null ) => void;
	onDropBefore: ( event: React.DragEvent, elementId: string, index: number, parentId: string | null ) => void;
	parentId: string | null;
	selectedIds: string[];
	siblingIndex: number;
};

function NavigatorItem( {
	activeDropId,
	depth,
	element,
	onActivateDrop,
	onDropBefore,
	parentId,
	selectedIds,
	siblingIndex,
}: NavigatorItemProps ) {
	const isSelected = selectedIds.includes( element.id );
	const dropId = `${ parentId ?? 'root' }:${ siblingIndex }`;

	const handleDragStart = ( event: React.DragEvent ) => {
		const payload: ElementDragPayload = {
			source: 'element',
			id: element.id,
		};

		setDragPayload( event.dataTransfer, payload );
	};

	return (
		<>
			<ListItemButton
				draggable
				onClick={ () => dispatch( select( { ids: [ element.id ] } ) ) }
				onDragOver={ ( event ) => {
					event.preventDefault();
					onActivateDrop( dropId );
				} }
				onDragLeave={ () => onActivateDrop( null ) }
				onDrop={ ( event ) => onDropBefore( event, element.id, siblingIndex, parentId ) }
				onDragStart={ handleDragStart }
				selected={ isSelected || activeDropId === dropId }
				sx={ {
					borderLeft: activeDropId === dropId ? '2px solid' : '2px solid transparent',
					borderColor: activeDropId === dropId ? 'primary.main' : 'transparent',
					pl: 2 + depth * 1.5,
				} }
			>
				<ListItemText primary={ getElementLabel( element ) } secondary={ element.id } />
			</ListItemButton>
			{ element.elements?.map( ( child, index ) => (
				<NavigatorItem
					key={ child.id }
					activeDropId={ activeDropId }
					depth={ depth + 1 }
					element={ child }
					onActivateDrop={ onActivateDrop }
					onDropBefore={ onDropBefore }
					parentId={ element.id }
					selectedIds={ selectedIds }
					siblingIndex={ index }
				/>
			) ) }
		</>
	);
}

export default function Navigator() {
	const elements = useSelector(
		( state: { editorV5Document: { elements: ElementNode[] } } ) => state.editorV5Document.elements
	);
	const selectedIds = useSelector(
		( state: { editorV5Document: { selectedIds: string[] } } ) => state.editorV5Document.selectedIds
	);
	const [ activeDropId, setActiveDropId ] = useState< string | null >( null );

	const handleDropBefore = ( event: React.DragEvent, _elementId: string, index: number, parentId: string | null ) => {
		event.preventDefault();
		setActiveDropId( null );

		const payload = readDragPayload( event.dataTransfer );

		if ( ! payload || payload.source !== 'element' ) {
			return;
		}

		dispatch(
			moveElement( {
				id: payload.id,
				index,
				parentId,
			} )
		);
	};

	return (
		<PanelChrome subtitle="Drag to reorder" title="Navigator">
			<List dense sx={ { py: 1 } }>
				{ elements.map( ( element, index ) => (
					<NavigatorItem
						key={ element.id }
						activeDropId={ activeDropId }
						depth={ 0 }
						element={ element }
						onActivateDrop={ setActiveDropId }
						onDropBefore={ handleDropBefore }
						parentId={ null }
						selectedIds={ selectedIds }
						siblingIndex={ index }
					/>
				) ) }
			</List>
		</PanelChrome>
	);
}
