import * as React from 'react';
import { type ElementNode, select } from '@elementor/editor-v5-store';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import { List, ListItemButton, ListItemText, Typography } from '@elementor/ui';

type NavigatorItemProps = {
	element: ElementNode;
	depth: number;
	selectedIds: string[];
};

function getElementLabel( element: ElementNode ): string {
	if ( element.elType === 'widget' && element.widgetType ) {
		return element.widgetType;
	}

	return element.elType;
}

function NavigatorItem( { element, depth, selectedIds }: NavigatorItemProps ) {
	const isSelected = selectedIds.includes( element.id );

	return (
		<>
			<ListItemButton
				onClick={ () => dispatch( select( { ids: [ element.id ] } ) ) }
				selected={ isSelected }
				sx={ { pl: 2 + depth * 2 } }
			>
				<ListItemText primary={ getElementLabel( element ) } secondary={ element.id } />
			</ListItemButton>
			{ element.elements?.map( ( child ) => (
				<NavigatorItem key={ child.id } element={ child } depth={ depth + 1 } selectedIds={ selectedIds } />
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

	return (
		<>
			<Typography sx={ { p: 2, pb: 1 } } variant="subtitle2">
				Navigator
			</Typography>
			<List dense>
				{ elements.map( ( element ) => (
					<NavigatorItem key={ element.id } element={ element } depth={ 0 } selectedIds={ selectedIds } />
				) ) }
			</List>
		</>
	);
}
