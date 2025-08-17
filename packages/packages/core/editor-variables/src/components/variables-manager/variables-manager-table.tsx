import * as React from 'react';
import { createElement, useState } from 'react';
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
};

export const VariablesManagerTable = ( { menuActions, variables }: Props ) => {
	const [ ids, setIds ] = useState< string[] >( Object.keys( variables ) );
	const rows = ids.map( ( id ) => {
		const variable = variables[ id ];
		const variableType = getVariableType( variable.type );

		return {
			id,
			name: variable.label,
			value: variable.value,
			type: variable.type,
			...variableType,
		};
	} );

	const tableSX: SxProps = {
		minWidth: 250,
		tableLayout: 'fixed',
	};

	return (
		<TableContainer sx={ { overflow: 'initial' } }>
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
						onChange={ setIds }
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
									isDragOverlay,
									isSorting,
									index,
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
											disableDivider={ isDragOverlay || index === rows.length - 1 }
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
													onSave={ () => {} }
													prefixElement={ createElement( row.icon, { fontSize: 'inherit' } ) }
													editableElement={ ( { value, onChange } ) => (
														<LabelField
															id={ 'variable-label-' + row.id }
															size="tiny"
															value={ value }
															onChange={ onChange }
															focusOnShow
														/>
													) }
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
													onSave={ () => {} }
													editableElement={ row.valueField }
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
