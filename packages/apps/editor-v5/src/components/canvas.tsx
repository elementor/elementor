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
import { Box, Stack, Typography } from '@elementor/ui';

import { type DropTargetPayload, type ElementDragPayload, readDragPayload, setDragPayload } from '../utils/dnd';
import ElementPreview from './element-preview';

const ARTBOARD_MAX_WIDTH = 1140;
const DROP_INDICATOR_HEIGHT = 4;

type DropSlotProps = {
	active: boolean;
	onDragLeave: () => void;
	onDragOver: ( event: React.DragEvent ) => void;
	onDrop: ( event: React.DragEvent ) => void;
};

function DropSlot( { active, onDragLeave, onDragOver, onDrop }: DropSlotProps ) {
	return (
		<Box
			onDragLeave={ onDragLeave }
			onDragOver={ onDragOver }
			onDrop={ onDrop }
			sx={ {
				height: DROP_INDICATOR_HEIGHT,
				my: active ? 0.5 : 0,
				transition: 'margin 120ms ease',
			} }
		>
			{ active && (
				<Box
					sx={ {
						backgroundColor: 'primary.main',
						borderRadius: 999,
						height: DROP_INDICATOR_HEIGHT,
					} }
				/>
			) }
		</Box>
	);
}

type CanvasElementProps = {
	activeDrop: DropTargetPayload | null;
	element: ElementNode;
	onActivateDrop: ( target: DropTargetPayload | null ) => void;
	onDropAt: ( event: React.DragEvent, target: DropTargetPayload ) => void;
	parentId: string | null;
	selectedIds: string[];
	siblingIndex: number;
};

function CanvasElement( {
	activeDrop,
	element,
	onActivateDrop,
	onDropAt,
	parentId,
	selectedIds,
	siblingIndex,
}: CanvasElementProps ) {
	const isSelected = selectedIds.includes( element.id );
	const isContainer = isContainerElement( element );
	const dropTarget: DropTargetPayload = { parentId, index: siblingIndex };

	const handleClick = ( event: React.MouseEvent ) => {
		event.stopPropagation();
		dispatch( select( { ids: [ element.id ] } ) );
	};

	const handleDragStart = ( event: React.DragEvent ) => {
		event.stopPropagation();

		const payload: ElementDragPayload = {
			source: 'element',
			id: element.id,
		};

		setDragPayload( event.dataTransfer, payload );
	};

	const handleDragOver = ( event: React.DragEvent ) => {
		event.preventDefault();
		event.stopPropagation();
		onActivateDrop( dropTarget );
	};

	const handleDrop = ( event: React.DragEvent ) => {
		event.preventDefault();
		event.stopPropagation();
		onDropAt( event, dropTarget );
	};

	const isDropActive = activeDrop?.parentId === dropTarget.parentId && activeDrop?.index === dropTarget.index;

	return (
		<Box>
			<DropSlot
				active={ isDropActive }
				onDragLeave={ () => onActivateDrop( null ) }
				onDragOver={ handleDragOver }
				onDrop={ handleDrop }
			/>
			<Box
				draggable
				onClick={ handleClick }
				onDragStart={ handleDragStart }
				sx={ {
					'&:hover': {
						boxShadow: isSelected ? undefined : '0 0 0 1px rgba(30, 115, 190, 0.35)',
					},
					backgroundColor: 'background.paper',
					border: '1px solid',
					borderColor: isSelected ? 'primary.main' : 'transparent',
					borderRadius: 1,
					boxShadow: isSelected ? '0 0 0 2px rgba(30, 115, 190, 0.2)' : 'none',
					cursor: 'grab',
					p: isContainer ? 1.5 : 2,
					position: 'relative',
				} }
			>
				<Box
					sx={ {
						alignItems: 'center',
						color: 'text.secondary',
						display: 'flex',
						justifyContent: 'space-between',
						mb: isContainer ? 1 : 0,
					} }
				>
					<Typography
						sx={ { fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' } }
					>
						{ getElementLabel( element ) }
					</Typography>
					<Typography sx={ { fontSize: 10 } } variant="caption">
						⋮⋮
					</Typography>
				</Box>
				<ElementPreview element={ element } />
				{ isContainer && (
					<Stack spacing={ 0 } sx={ { mt: 1.5 } }>
						{ ( element.elements ?? [] ).map( ( child, index ) => (
							<CanvasElement
								key={ child.id }
								activeDrop={ activeDrop }
								element={ child }
								onActivateDrop={ onActivateDrop }
								onDropAt={ onDropAt }
								parentId={ element.id }
								selectedIds={ selectedIds }
								siblingIndex={ index }
							/>
						) ) }
						<ContainerEndDropSlot
							activeDrop={ activeDrop }
							containerId={ element.id }
							elementCount={ element.elements?.length ?? 0 }
							onActivateDrop={ onActivateDrop }
							onDropAt={ onDropAt }
						/>
					</Stack>
				) }
			</Box>
		</Box>
	);
}

type ContainerEndDropSlotProps = {
	activeDrop: DropTargetPayload | null;
	containerId: string;
	elementCount: number;
	onActivateDrop: ( target: DropTargetPayload | null ) => void;
	onDropAt: ( event: React.DragEvent, target: DropTargetPayload ) => void;
};

function ContainerEndDropSlot( {
	activeDrop,
	containerId,
	elementCount,
	onActivateDrop,
	onDropAt,
}: ContainerEndDropSlotProps ) {
	const dropTarget: DropTargetPayload = { parentId: containerId, index: elementCount };
	const isDropActive = activeDrop?.parentId === dropTarget.parentId && activeDrop?.index === dropTarget.index;

	return (
		<DropSlot
			active={ isDropActive }
			onDragLeave={ () => onActivateDrop( null ) }
			onDragOver={ ( event ) => {
				event.preventDefault();
				event.stopPropagation();
				onActivateDrop( dropTarget );
			} }
			onDrop={ ( event ) => onDropAt( event, dropTarget ) }
		/>
	);
}

export default function Canvas() {
	const elements = useSelector(
		( state: { editorV5Document: { elements: ElementNode[] } } ) => state.editorV5Document.elements
	);
	const selectedIds = useSelector(
		( state: { editorV5Document: { selectedIds: string[] } } ) => state.editorV5Document.selectedIds
	);
	const [ activeDrop, setActiveDrop ] = useState< DropTargetPayload | null >( null );

	const handleBackgroundClick = () => {
		dispatch( select( { ids: [] } ) );
	};

	const handleDropAt = ( event: React.DragEvent, target: DropTargetPayload ) => {
		event.preventDefault();
		setActiveDrop( null );

		const payload = readDragPayload( event.dataTransfer );

		if ( ! payload ) {
			return;
		}

		if ( payload.source === 'catalog' ) {
			dispatch(
				createElement( {
					elType: payload.elType,
					index: target.index,
					parentId: target.parentId,
					widgetType: payload.widgetType,
				} )
			);

			return;
		}

		dispatch(
			moveElement( {
				id: payload.id,
				parentId: target.parentId,
				index: target.index,
			} )
		);
	};

	const rootEndTarget: DropTargetPayload = { parentId: null, index: elements.length };
	const isRootEndActive =
		activeDrop?.parentId === rootEndTarget.parentId && activeDrop?.index === rootEndTarget.index;

	return (
		<Box
			onClick={ handleBackgroundClick }
			sx={ {
				backgroundColor: 'grey.100',
				flex: 1,
				minHeight: 0,
				overflow: 'auto',
				p: 3,
			} }
		>
			<Box
				onDragOver={ ( event ) => event.preventDefault() }
				sx={ {
					backgroundColor: 'background.paper',
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: 2,
					boxShadow: '0 12px 40px rgba(18, 25, 38, 0.08)',
					margin: '0 auto',
					maxWidth: ARTBOARD_MAX_WIDTH,
					minHeight: 720,
					p: 3,
				} }
			>
				{ elements.length ? (
					<Stack spacing={ 0 }>
						{ elements.map( ( element, index ) => (
							<CanvasElement
								key={ element.id }
								activeDrop={ activeDrop }
								element={ element }
								onActivateDrop={ setActiveDrop }
								onDropAt={ handleDropAt }
								parentId={ null }
								selectedIds={ selectedIds }
								siblingIndex={ index }
							/>
						) ) }
						<DropSlot
							active={ isRootEndActive }
							onDragLeave={ () => setActiveDrop( null ) }
							onDragOver={ ( event ) => {
								event.preventDefault();
								setActiveDrop( rootEndTarget );
							} }
							onDrop={ ( event ) => handleDropAt( event, rootEndTarget ) }
						/>
					</Stack>
				) : (
					<Box
						onDragOver={ ( event ) => {
							event.preventDefault();
							setActiveDrop( { parentId: null, index: 0 } );
						} }
						onDrop={ ( event ) => handleDropAt( event, { parentId: null, index: 0 } ) }
						sx={ {
							alignItems: 'center',
							border: '2px dashed',
							borderColor: activeDrop ? 'primary.main' : 'grey.300',
							borderRadius: 2,
							color: 'text.secondary',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							minHeight: 420,
							textAlign: 'center',
						} }
					>
						<Typography sx={ { fontWeight: 600, mb: 1 } } variant="h6">
							Start building your page
						</Typography>
						<Typography variant="body2">Drag elements from the left panel or click to add them.</Typography>
					</Box>
				) }
			</Box>
		</Box>
	);
}
