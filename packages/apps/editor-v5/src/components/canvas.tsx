import * as React from 'react';
import { useState } from 'react';
import {
	createElement,
	type ElementNode,
	getContainerLayoutSx,
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
const NESTED_INDENT_PX = 16;

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
				<Box sx={ { backgroundColor: 'primary.main', borderRadius: 999, height: DROP_INDICATOR_HEIGHT } } />
			) }
		</Box>
	);
}

type CanvasElementProps = {
	activeDrop: DropTargetPayload | null;
	depth: number;
	element: ElementNode;
	onActivateDrop: ( target: DropTargetPayload | null ) => void;
	onDropAt: ( event: React.DragEvent, target: DropTargetPayload ) => void;
	parentId: string | null;
	selectedIds: string[];
	siblingIndex: number;
};

function CanvasElement( {
	activeDrop,
	depth,
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
	const isDropActive = activeDrop?.parentId === dropTarget.parentId && activeDrop?.index === dropTarget.index;
	const children = element.elements ?? [];
	const containerAppendTarget: DropTargetPayload = { parentId: element.id, index: children.length };
	const isContainerDropActive =
		isContainer &&
		activeDrop?.parentId === containerAppendTarget.parentId &&
		activeDrop?.index === containerAppendTarget.index;

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

	const getContainerBorderColor = () => {
		if ( isContainerDropActive ) {
			return 'primary.main';
		}

		if ( children.length ) {
			return 'transparent';
		}

		return 'grey.300';
	};

	const containerBorderColor = getContainerBorderColor();

	return (
		<Box sx={ { pl: depth > 0 ? `${ NESTED_INDENT_PX }px` : 0 } }>
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
			<Box
				draggable
				onClick={ handleClick }
				onDragStart={ handleDragStart }
				sx={ {
					'&:hover': {
						boxShadow: isSelected ? undefined : '0 0 0 1px rgba(30, 115, 190, 0.35)',
					},
					backgroundColor: isContainer ? 'grey.50' : 'background.paper',
					border: '1px solid',
					borderColor: isSelected ? 'primary.main' : 'divider',
					borderRadius: 1.5,
					boxShadow: isSelected ? '0 0 0 2px rgba(30, 115, 190, 0.18)' : 'none',
					cursor: 'grab',
					overflow: 'hidden',
					position: 'relative',
				} }
			>
				<Box
					sx={ {
						alignItems: 'center',
						backgroundColor: isContainer ? 'grey.100' : 'transparent',
						borderBottom: isContainer ? '1px solid' : 'none',
						borderColor: 'divider',
						color: 'text.secondary',
						display: 'flex',
						justifyContent: 'space-between',
						px: 1.5,
						py: 0.75,
					} }
				>
					<Typography
						sx={ { fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' } }
					>
						{ getElementLabel( element ) }
					</Typography>
					<Typography sx={ { fontSize: 10 } } variant="caption">
						{ isContainer ? `${ children.length } nested` : '⋮⋮' }
					</Typography>
				</Box>
				<Box sx={ { p: isContainer ? 1.5 : 2 } }>
					{ ! isContainer && <ElementPreview element={ element } /> }
					{ isContainer && (
						<Box
							onDragLeave={ ( event ) => {
								event.stopPropagation();
								onActivateDrop( null );
							} }
							onDragOver={ ( event ) => {
								event.preventDefault();
								event.stopPropagation();
								onActivateDrop( containerAppendTarget );
							} }
							onDrop={ ( event ) => onDropAt( event, containerAppendTarget ) }
							sx={ {
								...getContainerLayoutSx( element ),
								backgroundColor: isContainerDropActive ? 'rgba(30, 115, 190, 0.06)' : 'transparent',
								border: '1px dashed',
								borderColor: containerBorderColor,
								borderRadius: 1,
								minHeight: children.length ? undefined : 96,
								p: children.length ? 0 : 1.5,
								transition: 'background-color 120ms ease, border-color 120ms ease',
							} }
						>
							{ ! children.length && (
								<Box
									sx={ {
										alignItems: 'center',
										color: 'text.secondary',
										display: 'flex',
										justifyContent: 'center',
										minHeight: 72,
										textAlign: 'center',
									} }
								>
									<Typography variant="caption">Drop widgets or containers here</Typography>
								</Box>
							) }
							{ children.map( ( child, index ) => (
								<CanvasElement
									key={ child.id }
									activeDrop={ activeDrop }
									depth={ depth + 1 }
									element={ child }
									onActivateDrop={ onActivateDrop }
									onDropAt={ onDropAt }
									parentId={ element.id }
									selectedIds={ selectedIds }
									siblingIndex={ index }
								/>
							) ) }
							{ children.length > 0 && (
								<DropSlot
									active={ isContainerDropActive }
									onDragLeave={ () => onActivateDrop( null ) }
									onDragOver={ ( event ) => {
										event.preventDefault();
										event.stopPropagation();
										onActivateDrop( containerAppendTarget );
									} }
									onDrop={ ( event ) => onDropAt( event, containerAppendTarget ) }
								/>
							) }
						</Box>
					) }
				</Box>
			</Box>
		</Box>
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
				index: target.index,
				parentId: target.parentId,
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
					<Stack spacing={ 0.5 }>
						{ elements.map( ( element, index ) => (
							<CanvasElement
								key={ element.id }
								activeDrop={ activeDrop }
								depth={ 0 }
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
						<Typography variant="body2">
							Add a container, then drag widgets inside it — nesting is supported in this POC.
						</Typography>
					</Box>
				) }
			</Box>
		</Box>
	);
}
