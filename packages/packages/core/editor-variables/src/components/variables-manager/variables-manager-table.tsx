import * as React from 'react';
import { createElement, useEffect, useRef } from 'react';
import { EllipsisWithTooltip } from '@elementor/editor-ui';
import { GripVerticalIcon } from '@elementor/icons';
import {
	IconButton,
	Stack,
	type SxProps,
	Table,
	TableBody,
	TableContainer,
	TableHead,
	TableRow,
	UnstableSortableItem,
	type UnstableSortableItemRenderProps,
	UnstableSortableProvider,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type TVariablesList } from '../../storage';
import { getVariableType } from '../../variables-registry/variable-type-registry';
import { LabelField } from '../fields/label-field';
import { VariableEditMenu, type VariableManagerMenuAction } from './variable-edit-menu';
import { VariableEditableCell } from './variable-editable-cell';
import { VariableTableCell } from './variable-table-cell';

type Props = {
	menuActions: VariableManagerMenuAction[];
	variables: TVariablesList;
	onChange: ( variables: TVariablesList ) => void;
	ids: string[];
	onIdsChange: ( ids: string[] ) => void;
	autoEditVariableId?: string;
	onAutoEditComplete?: () => void;
};

export const VariablesManagerTable = ( {
	menuActions,
	variables,
	onChange: handleOnChange,
	ids,
	onIdsChange: setIds,
	autoEditVariableId,
	onAutoEditComplete,
}: Props ) => {
	const tableContainerRef = useRef< HTMLDivElement >( null );
	const variableRowRefs = useRef< Map< string, HTMLTableRowElement > >( new Map() );

	useEffect( () => {
		if ( autoEditVariableId && tableContainerRef.current ) {
			const rowElement = variableRowRefs.current.get( autoEditVariableId );
			if ( rowElement ) {
				setTimeout( () => {
					rowElement.scrollIntoView( {
						behavior: 'smooth',
						block: 'center',
						inline: 'nearest',
					} );
				}, 100 );
			}
		}
	}, [ autoEditVariableId ] );

	const handleRowRef = ( id: string ) => ( ref: HTMLTableRowElement | null ) => {
		if ( ref ) {
			variableRowRefs.current.set( id, ref );
		} else {
			variableRowRefs.current.delete( id );
		}
	};

	useEffect( () => {
		const sortedIds = [ ...ids ].sort( sortVariablesOrder( variables ) );

		if ( JSON.stringify( sortedIds ) !== JSON.stringify( ids ) ) {
			setIds( sortedIds );
		}
	}, [ ids, variables, setIds ] );

	const rows = ids
		.filter( ( id ) => ! variables[ id ].deleted )
		.sort( sortVariablesOrder( variables ) )
		.map( ( id ) => {
			const variable = variables[ id ];
			const variableType = getVariableType( variable.type );

			return {
				id,
				type: variable.type,
				name: variable.label,
				value: variable.value,
				...variableType,
			};
		} );

	const tableSX: SxProps = {
		minWidth: 250,
		tableLayout: 'fixed',
	};

	return (
		<TableContainer ref={ tableContainerRef } sx={ { overflow: 'initial' } }>
			<Table sx={ tableSX } aria-label="Variables manager list with drag and drop reordering" stickyHeader>
				<TableHead>
					<TableRow>
						<VariableTableCell isHeader noPadding width={ 10 } maxWidth={ 10 } />
						<VariableTableCell isHeader>{ __( 'Name', 'elementor' ) }</VariableTableCell>
						<VariableTableCell isHeader>{ __( 'Value', 'elementor' ) }</VariableTableCell>
						<VariableTableCell isHeader noPadding width={ 16 } maxWidth={ 16 } />
					</TableRow>
				</TableHead>
				<TableBody>
					<UnstableSortableProvider
						value={ ids }
						onChange={ ( newIds ) => {
							const updatedVariables = { ...variables };
							newIds.forEach( ( id, index ) => {
								if ( updatedVariables[ id ] ) {
									updatedVariables[ id ] = {
										...updatedVariables[ id ],
										order: index + 1,
									};
								}
							} );
							handleOnChange( updatedVariables );
							setIds( newIds );
						} }
						variant="static"
						restrictAxis
						dragOverlay={ ( { children: dragOverlayChildren, ...dragOverlayProps } ) => (
							<Table sx={ tableSX } { ...dragOverlayProps }>
								<TableBody>{ dragOverlayChildren }</TableBody>
							</Table>
						) }
					>
						{ rows.map( ( row ) => (
							<UnstableSortableItem
								key={ row.id }
								id={ row.id }
								render={ ( {
									itemProps,
									showDropIndication,
									triggerProps,
									itemStyle,
									triggerStyle,
									isDragged,
									dropPosition,
									setTriggerRef,
									isSorting,
								}: UnstableSortableItemRenderProps ) => {
									const showIndicationBefore = showDropIndication && dropPosition === 'before';
									const showIndicationAfter = showDropIndication && dropPosition === 'after';

									return (
										<TableRow
											{ ...itemProps }
											selected={ isDragged }
											sx={ {
												...( showIndicationBefore && {
													'& td, & th': {
														borderTop: '2px solid',
														borderTopColor: 'primary.main',
													},
												} ),
												...( showIndicationAfter && {
													'& td, & th': {
														borderBottom: '2px solid',
														borderBottomColor: 'primary.main',
													},
												} ),
												'& [role="toolbar"], & [draggable]': {
													opacity: 0,
												},
												'&:hover, &:focus-within': {
													backgroundColor: 'action.hover',
													'& [role="toolbar"], & [draggable]': {
														opacity: 1,
													},
												},
											} }
											style={ { ...itemStyle, ...triggerStyle } }
										>
											<VariableTableCell noPadding width={ 10 } maxWidth={ 10 }>
												<IconButton
													size="small"
													ref={ setTriggerRef }
													{ ...triggerProps }
													disabled={ isSorting }
													draggable
												>
													<GripVerticalIcon fontSize="inherit" />
												</IconButton>
											</VariableTableCell>
											<VariableTableCell>
												<VariableEditableCell
													initialValue={ row.name }
													onChange={ ( value ) => {
														if ( value !== row.name ) {
															handleOnChange( {
																...variables,
																[ row.id ]: { ...variables[ row.id ], label: value },
															} );
														}
													} }
													prefixElement={ createElement( row.icon, { fontSize: 'inherit' } ) }
													editableElement={ ( { value, onChange } ) => (
														<LabelField
															id={ 'variable-label-' + row.id }
															size="tiny"
															value={ value }
															onChange={ onChange }
															focusOnShow
															selectOnShow={ autoEditVariableId === row.id }
														/>
													) }
													autoEdit={ autoEditVariableId === row.id }
													onRowRef={ handleRowRef( row.id ) }
													onAutoEditComplete={
														autoEditVariableId === row.id ? onAutoEditComplete : undefined
													}
												>
													<EllipsisWithTooltip
														title={ row.name }
														sx={ { border: '4px solid transparent' } }
													>
														{ row.name }
													</EllipsisWithTooltip>
												</VariableEditableCell>
											</VariableTableCell>
											<VariableTableCell>
												<VariableEditableCell
													initialValue={ row.value }
													onChange={ ( value ) => {
														if ( value !== row.value ) {
															handleOnChange( {
																...variables,
																[ row.id ]: { ...variables[ row.id ], value },
															} );
														}
													} }
													editableElement={ row.valueField }
													onRowRef={ handleRowRef( row.id ) }
												>
													{ row.startIcon && row.startIcon( { value: row.value } ) }
													<EllipsisWithTooltip
														title={ row.value }
														sx={ { border: '4px solid transparent' } }
													>
														{ row.value }
													</EllipsisWithTooltip>
												</VariableEditableCell>
											</VariableTableCell>
											<VariableTableCell
												align="right"
												noPadding
												width={ 16 }
												maxWidth={ 16 }
												sx={ { paddingInlineEnd: 1 } }
											>
												<Stack role="toolbar" direction="row" justifyContent="flex-end">
													<VariableEditMenu
														menuActions={ menuActions }
														disabled={ isSorting }
														itemId={ row.id }
													/>
												</Stack>
											</VariableTableCell>
										</TableRow>
									);
								} }
							/>
						) ) }
					</UnstableSortableProvider>
				</TableBody>
			</Table>
		</TableContainer>
	);
};
function sortVariablesOrder( variables: TVariablesList ): ( a: string, b: string ) => number {
	return ( a, b ) => {
		const orderA = variables[ a ]?.order ?? Number.MAX_SAFE_INTEGER;
		const orderB = variables[ b ]?.order ?? Number.MAX_SAFE_INTEGER;
		return orderA - orderB;
	};
}
