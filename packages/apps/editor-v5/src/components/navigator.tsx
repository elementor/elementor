import * as React from 'react';
import { useState } from 'react';
import {
	createElement,
	type ElementNode,
	getElementLabel,
	isContainerElement,
	moveElement,
	select,
} from '@elementor/editor-v5-store';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import { Box, List, ListItemButton, ListItemText, Typography } from '@elementor/ui';

import { type ElementDragPayload, readDragPayload, setDragPayload } from '../utils/dnd';
import PanelChrome from './panel-chrome';

type NavigatorItemProps = {
	activeDropId: string | null;
	depth: number;
	element: ElementNode;
	onActivateDrop: ( dropId: string | null ) => void;
	onDropAt: ( event: React.DragEvent, parentId: string | null, index: number ) => void;
	parentId: string | null;
	selectedIds: string[];
	siblingIndex: number;
};

function NavigatorItem( {
	activeDropId,
	depth,
	element,
	onActivateDrop,
	onDropAt,
	parentId,
	selectedIds,
	siblingIndex,
}: NavigatorItemProps ) {
	const isSelected = selectedIds.includes( element.id );
	const dropId = `${ parentId ?? 'root' }:${ siblingIndex }`;
	const children = element.elements ?? [];
	const isContainer = isContainerElement( element );

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
				onDragLeave={ () => onActivateDrop( null ) }
				onDragOver={ ( event ) => {
					event.preventDefault();
					onActivateDrop( dropId );
				} }
				onDragStart={ handleDragStart }
				onDrop={ ( event ) => onDropAt( event, parentId, siblingIndex ) }
				selected={ isSelected || activeDropId === dropId }
				sx={ {
					borderLeft: activeDropId === dropId ? '2px solid' : '2px solid transparent',
					borderColor: activeDropId === dropId ? 'primary.main' : 'transparent',
					pl: 2 + depth * 1.5,
				} }
			>
				<ListItemText
					primary={ getElementLabel( element ) }
					secondary={ isContainer ? `${ children.length } children` : element.id }
					primaryTypographyProps={ { variant: 'body2' } }
					secondaryTypographyProps={ { variant: 'caption' } }
				/>
			</ListItemButton>
			{ children.map( ( child, index ) => (
				<NavigatorItem
					key={ child.id }
					activeDropId={ activeDropId }
					depth={ depth + 1 }
					element={ child }
					onActivateDrop={ onActivateDrop }
					onDropAt={ onDropAt }
					parentId={ element.id }
					selectedIds={ selectedIds }
					siblingIndex={ index }
				/>
			) ) }
			{ isContainer && (
				<NavigatorDropRow
					activeDropId={ activeDropId }
					depth={ depth + 1 }
					dropId={ `${ element.id }:${ children.length }` }
					label="Drop inside container"
					onActivateDrop={ onActivateDrop }
					onDrop={ ( event ) => onDropAt( event, element.id, children.length ) }
				/>
			) }
		</>
	);
}

function NavigatorDropRow( {
	activeDropId,
	depth,
	dropId,
	label,
	onActivateDrop,
	onDrop,
}: {
	activeDropId: string | null;
	depth: number;
	dropId: string;
	label: string;
	onActivateDrop: ( dropId: string | null ) => void;
	onDrop: ( event: React.DragEvent ) => void;
} ) {
	return (
		<Box
			onDragLeave={ () => onActivateDrop( null ) }
			onDragOver={ ( event ) => {
				event.preventDefault();
				onActivateDrop( dropId );
			} }
			onDrop={ onDrop }
			sx={ {
				borderLeft: activeDropId === dropId ? '2px solid' : '2px dashed transparent',
				borderColor: activeDropId === dropId ? 'primary.main' : 'divider',
				color: 'text.secondary',
				fontSize: 12,
				ml: 2 + depth * 1.5,
				mr: 1,
				my: 0.5,
				px: 1,
				py: 0.75,
			} }
		>
			{ label }
		</Box>
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

	const handleDropAt = ( event: React.DragEvent, parentId: string | null, index: number ) => {
		event.preventDefault();
		setActiveDropId( null );

		const payload = readDragPayload( event.dataTransfer );

		if ( ! payload ) {
			return;
		}

		if ( payload.source === 'catalog' ) {
			dispatch(
				createElement( {
					elType: payload.elType,
					index,
					parentId,
					widgetType: payload.widgetType,
				} )
			);

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
		<PanelChrome subtitle="Drag to reorder or nest" title="Navigator">
			{ elements.length ? (
				<List dense sx={ { py: 1 } }>
					{ elements.map( ( element, index ) => (
						<NavigatorItem
							key={ element.id }
							activeDropId={ activeDropId }
							depth={ 0 }
							element={ element }
							onActivateDrop={ setActiveDropId }
							onDropAt={ handleDropAt }
							parentId={ null }
							selectedIds={ selectedIds }
							siblingIndex={ index }
						/>
					) ) }
					<NavigatorDropRow
						activeDropId={ activeDropId }
						depth={ 0 }
						dropId={ `root:${ elements.length }` }
						label="Drop at page root"
						onActivateDrop={ setActiveDropId }
						onDrop={ ( event ) => handleDropAt( event, null, elements.length ) }
					/>
				</List>
			) : (
				<Typography color="text.secondary" sx={ { p: 2 } } variant="body2">
					No elements yet.
				</Typography>
			) }
		</PanelChrome>
	);
}
