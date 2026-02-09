import * as React from 'react';
import { createElement } from 'react';
import { EllipsisWithTooltip } from '@elementor/editor-ui';
import { GripVerticalIcon } from '@elementor/icons';
import { IconButton, Stack, TableRow, type UnstableSortableItemRenderProps } from '@elementor/ui';

import { useQuotaPermissions } from '../../../hooks/use-quota-permissions';
import { type TVariablesList } from '../../../storage';
import { type getVariableType } from '../../../variables-registry/variable-type-registry';
import { LabelField } from '../../fields/label-field';
import { VariablePromotionChip } from '../../ui/variable-promotion-chip';
import { VariableEditableCell } from '../variable-editable-cell';
import { VariableEditMenu, type VariableManagerMenuAction } from './variable-edit-menu';
import { VariableTableCell } from './variable-table-cell';

export type Row = ReturnType< typeof getVariableType > & {
	id: string;
	type: string;
	name: string;
	value: string;
};
export const VariableRow = (
	props: UnstableSortableItemRenderProps & {
		row: Row;
		variables: TVariablesList;
		handleOnChange: ( variables: TVariablesList ) => void;
		autoEditVariableId?: string;
		onAutoEditComplete?: () => void;
		onFieldError?: ( hasError: boolean ) => void;
		menuActions: ( variableId: string ) => VariableManagerMenuAction[];
		handleRowRef: ( id: string ) => ( ref: HTMLTableRowElement | null ) => void;
	}
) => {
	const {
		row,
		variables,
		handleOnChange,
		autoEditVariableId,
		onAutoEditComplete,
		onFieldError,
		menuActions,
		handleRowRef,
		itemProps,
		showDropIndication,
		triggerProps,
		itemStyle,
		triggerStyle,
		isDragged,
		dropPosition,
		setTriggerRef,
		isSorting,
	} = props;
	const isDisabled = ! useQuotaPermissions( row.type ).canEdit();

	const showIndicationBefore = showDropIndication && dropPosition === 'before';
	const showIndicationAfter = showDropIndication && dropPosition === 'after';

	return (
		<TableRow
			{ ...itemProps }
			ref={ itemProps.ref }
			selected={ isDragged }
			sx={ {
				...( isDisabled && {
					'& td, & th': {
						color: 'text.disabled',
					},
				} ),
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
				'&:hover, &:focus-within': {
					backgroundColor: 'action.hover',
					'& [role="toolbar"], & [draggable]': {
						opacity: 1,
					},
				},
				'& [role="toolbar"], & [draggable]': {
					opacity: 0,
				},
			} }
			style={ { ...itemStyle, ...triggerStyle } }
		>
			<VariableTableCell noPadding width={ 10 } maxWidth={ 10 }>
				<IconButton size="small" ref={ setTriggerRef } { ...triggerProps } disabled={ isSorting } draggable>
					<GripVerticalIcon fontSize="inherit" />
				</IconButton>
			</VariableTableCell>
			<VariableTableCell>
				<VariableEditableCell
					initialValue={ row.name }
					onChange={ ( value ) => {
						if ( value !== row.name && ! isDisabled ) {
							handleOnChange( {
								...variables,
								[ row.id ]: { ...variables[ row.id ], label: value },
							} );
						}
					} }
					prefixElement={ createElement( row.icon, {
						fontSize: 'inherit',
						color: isDisabled ? 'disabled' : 'inherit',
					} ) }
					editableElement={ ( { value, onChange, onValidationChange, error } ) => (
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
							disabled={ isDisabled }
						/>
					) }
					autoEdit={ autoEditVariableId === row.id && ! isDisabled }
					onRowRef={ handleRowRef( row.id ) }
					onAutoEditComplete={ autoEditVariableId === row.id ? onAutoEditComplete : undefined }
					fieldType="label"
				>
					<EllipsisWithTooltip title={ row.name } sx={ { border: '4px solid transparent' } }>
						{ row.name }
					</EllipsisWithTooltip>
				</VariableEditableCell>
			</VariableTableCell>
			<VariableTableCell>
				<VariableEditableCell
					initialValue={ row.value }
					onChange={ ( value ) => {
						if ( value !== row.value && ! isDisabled ) {
							handleOnChange( {
								...variables,
								[ row.id ]: { ...variables[ row.id ], value },
							} );
						}
					} }
					editableElement={ ( { value, onChange, onValidationChange, error } ) =>
						row.valueField?.( {
							value,
							onChange,
							onPropTypeKeyChange: ( type ) => {
								if ( ! isDisabled ) {
									handleOnChange( {
										...variables,
										[ row.id ]: { ...variables[ row.id ], type },
									} );
								}
							},
							propTypeKey: row.type,
							onValidationChange: ( errorMsg ) => {
								onValidationChange?.( errorMsg );
								onFieldError?.( !! errorMsg );
							},
							error,
							disabled: isDisabled,
						} ) ?? <></>
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
			<VariableTableCell align="right" noPadding width={ 16 } maxWidth={ 16 } sx={ { paddingInlineEnd: 1 } }>
				<Stack role="toolbar" direction="row" justifyContent="flex-end" alignItems="center">
					{ isDisabled && (
						<VariablePromotionChip
							variableType={ row.variableType }
							upgradeUrl={ `https://go.elementor.com/renew-license-manager-${ row.variableType }-variable` }
						/>
					) }
					<VariableEditMenu menuActions={ menuActions( row.id ) } disabled={ isSorting } itemId={ row.id } />
				</Stack>
			</VariableTableCell>
		</TableRow>
	);
};
