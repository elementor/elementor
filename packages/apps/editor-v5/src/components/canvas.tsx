import * as React from 'react';
import { type ElementNode, select } from '@elementor/editor-v5-store';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import { Box, Typography } from '@elementor/ui';

type CanvasElementProps = {
	element: ElementNode;
	selectedIds: string[];
};

function getElementLabel( element: ElementNode ): string {
	if ( element.elType === 'widget' && element.widgetType ) {
		return element.widgetType;
	}

	return element.elType;
}

function CanvasElement( { element, selectedIds }: CanvasElementProps ) {
	const isSelected = selectedIds.includes( element.id );

	const handleClick = ( event: React.MouseEvent ) => {
		event.stopPropagation();
		dispatch( select( { ids: [ element.id ] } ) );
	};

	return (
		<Box
			onClick={ handleClick }
			sx={ {
				border: '1px solid',
				borderColor: isSelected ? 'primary.main' : 'divider',
				borderRadius: 1,
				mb: 1,
				p: 1,
			} }
		>
			<Typography variant="caption">
				{ getElementLabel( element ) } ({ element.id })
			</Typography>
			{ element.elements?.map( ( child ) => (
				<CanvasElement key={ child.id } element={ child } selectedIds={ selectedIds } />
			) ) }
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

	const handleBackgroundClick = () => {
		dispatch( select( { ids: [] } ) );
	};

	return (
		<Box onClick={ handleBackgroundClick } sx={ { minHeight: '100%' } }>
			{ elements.length ? (
				elements.map( ( element ) => (
					<CanvasElement key={ element.id } element={ element } selectedIds={ selectedIds } />
				) )
			) : (
				<Typography color="text.secondary">Add an atomic element from the panel.</Typography>
			) }
		</Box>
	);
}
