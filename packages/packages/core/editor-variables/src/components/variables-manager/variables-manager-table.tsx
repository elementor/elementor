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
import { VariableEditMenu, type VariableManagerMenuAction } from './ui/variable-edit-menu';
import { VariableTableCell } from './ui/variable-table-cell';
import { VariableEditableCell } from './variable-editable-cell';

type Props = {
	menuActions: VariableManagerMenuAction[];
	variables: TVariablesList;
	onChange: ( variables: TVariablesList ) => void;
	autoEditVariableId?: string;
	onAutoEditComplete?: () => void;
	onFieldError?: ( hasError: boolean ) => void;
};

type Row = ReturnType< typeof getVariableType > & {
	id: string;
	type: string;
	name: string;
	value: string;
};

export const VariablesManagerTable = ( {
	menuActions,
	variables,
	onChange: handleOnChange,
	autoEditVariableId,
	onAutoEditComplete,
	onFieldError,
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

	const ids = Object.keys( variables ).sort( sortVariablesOrder( variables ) );
	const rows = ids
		.filter( ( id ) => ! variables[ id ].deleted )
		.map( ( id ) => {
			const variable = variables[ id ];
			const variableType = getVariableType( variable.type );

			if ( ! variableType ) {
				return null;
			}

			return {
				id,
				type: variable.type,
				name: variable.label,
				value: variable.value,
				...variableType,
			};
		} )
		.filter( Boolean ) as Row[];

	const tableSX: SxProps = {
		minWidth: 250,
		tableLayout: 'fixed',
	};

	const handleReorder = ( newIds: string[] ) => {
		const updatedVariables = { ...variables };

		newIds.forEach( ( id, index ) => {
			const current = updatedVariables[ id ];

			if ( ! current ) {
				return;
			}

			updatedVariables[ id ] = Object.assign( {}, current, { order: index + 1 } );
		} );

		handleOnChange( updatedVariables );
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
						onChange={ handleReorder }
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
											ref={ handleRowRef( 'table-ref-' + row.id ) }
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
													editableElement={ ( {
														value,
														onChange,
														onValidationChange,
														error,
													} ) => (
														<LabelField
															id={ 'variable-label-' + row.id }
															size="tiny"
															value={ value }
															onChange={ onChange }
															onErrorChange={ ( errorMsg ) => {
																onValidationChange?.( errorMsg );
																onFieldError?.( !! errorMsg );
															} }
															error={ error }
															focusOnShow
															selectOnShow={ autoEditVariableId === row.id }
															showWarningInfotip={ true }
															variables={ variables }
														/>
													) }
													autoEdit={ autoEditVariableId === row.id }
													onRowRef={ handleRowRef( row.id ) }
													onAutoEditComplete={
														autoEditVariableId === row.id ? onAutoEditComplete : undefined
													}
													fieldType="label"
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
													editableElement={ ( {
														value,
														onChange,
														onValidationChange,
														error,
													} ) =>
														row.valueField( {
															ref: {
																current: variableRowRefs.current.get(
																	'table-ref-' + row.id
																) as HTMLElement,
															},
															value,
															onChange,
															onPropTypeKeyChange: ( type ) => {
																handleOnChange( {
																	...variables,
																	[ row.id ]: { ...variables[ row.id ], type },
																} );
															},
															propTypeKey: row.type,
															onValidationChange: ( errorMsg ) => {
																onValidationChange?.( errorMsg );
																onFieldError?.( !! errorMsg );
															},
															error,
														} )
													}
													onRowRef={ handleRowRef( row.id ) }
													gap={ 0.25 }
													fieldType="value"
												>
													{ row.startIcon && row.startIcon( { value: row.value } ) }
													<EllipsisWithTooltip
														title={ row.value }
														sx={ {
															border: '4px solid transparent',
															lineHeight: '1',
															pt: 0.25,
														} }
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
