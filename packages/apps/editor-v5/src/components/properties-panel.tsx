import * as React from 'react';
import { useEffect, useState } from 'react';
import {
	type ElementNode,
	getAtomicStringSetting,
	getElementLabel,
	removeElement,
	updateSetting,
} from '@elementor/editor-v5-store';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import { Box, Button, Stack, TextField, Typography } from '@elementor/ui';

function getEditableSettingKey( element: ElementNode ): string | null {
	const widgetType = element.widgetType ?? element.elType;

	switch ( widgetType ) {
		case 'e-heading':
			return 'title';
		case 'e-paragraph':
			return 'paragraph';
		case 'e-button':
			return 'text';
		default:
			return null;
	}
}

export default function PropertiesPanel() {
	const selectedIds = useSelector(
		( state: { editorV5Document: { selectedIds: string[] } } ) => state.editorV5Document.selectedIds
	);
	const elements = useSelector(
		( state: { editorV5Document: { elements: ElementNode[] } } ) => state.editorV5Document.elements
	);
	const [ draftValue, setDraftValue ] = useState( '' );

	const selectedId = selectedIds[ 0 ] ?? null;

	useEffect( () => {
		if ( ! selectedId ) {
			setDraftValue( '' );
			return;
		}

		const findSelected = ( nodes: ElementNode[] ): ElementNode | null => {
			for ( const node of nodes ) {
				if ( node.id === selectedId ) {
					return node;
				}

				const child = findSelected( node.elements ?? [] );

				if ( child ) {
					return child;
				}
			}

			return null;
		};

		const selected = findSelected( elements );
		const settingKey = selected ? getEditableSettingKey( selected ) : null;

		setDraftValue( selected && settingKey ? getAtomicStringSetting( selected.settings, settingKey ) : '' );
	}, [ elements, selectedId ] );

	if ( ! selectedId ) {
		return (
			<Box sx={ { color: 'text.secondary', p: 2 } }>
				<Typography variant="body2">Select an element to edit its content.</Typography>
			</Box>
		);
	}

	const findSelected = ( nodes: ElementNode[] ): ElementNode | null => {
		for ( const node of nodes ) {
			if ( node.id === selectedId ) {
				return node;
			}

			const child = findSelected( node.elements ?? [] );

			if ( child ) {
				return child;
			}
		}

		return null;
	};

	const selected = findSelected( elements );

	if ( ! selected ) {
		return null;
	}

	const settingKey = getEditableSettingKey( selected );

	const handleApply = () => {
		if ( ! settingKey ) {
			return;
		}

		dispatch(
			updateSetting( {
				id: selected.id,
				key: settingKey,
				value: {
					$$type: 'string',
					value: draftValue,
				},
			} )
		);
	};

	const handleDelete = () => {
		dispatch( removeElement( { id: selected.id } ) );
	};

	return (
		<Stack spacing={ 2 } sx={ { p: 2 } }>
			<Box>
				<Typography sx={ { fontWeight: 600 } } variant="subtitle2">
					{ getElementLabel( selected ) }
				</Typography>
				<Typography color="text.secondary" variant="caption">
					{ selected.id }
				</Typography>
			</Box>
			{ settingKey ? (
				<TextField
					fullWidth
					label="Content"
					minRows={ 3 }
					multiline
					onChange={ ( event ) => setDraftValue( event.target.value ) }
					size="small"
					value={ draftValue }
				/>
			) : (
				<Typography color="text.secondary" variant="body2">
					No quick-edit fields for this element yet.
				</Typography>
			) }
			<Stack direction="row" spacing={ 1 }>
				{ settingKey && (
					<Button onClick={ handleApply } size="small" variant="contained">
						Apply
					</Button>
				) }
				<Button color="error" onClick={ handleDelete } size="small" variant="outlined">
					Delete
				</Button>
			</Stack>
		</Stack>
	);
}
