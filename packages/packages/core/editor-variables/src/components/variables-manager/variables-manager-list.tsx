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

import { getVariables } from '../../hooks/use-prop-variables';
import { getVariableType } from '../../variables-registry/variable-type-registry';
import { type VariableManagerMenuAction, VariableMenu } from './variables-manager-menu';
import { VariableTableCell } from './variables-manager-table-cell';

type Props = {
	menuActions: VariableManagerMenuAction[];
};

export const VariablesManagerList = ( { menuActions }: Props ) => {
	const variables = getVariables( false );

	const [ ids, setIds ] = useState< string[] >( Object.keys( variables ) );
	const rows = ids.map( ( id ) => ( {
		id,
		name: variables[ id ].label,
		value: variables[ id ].value,
		type: variables[ id ].type,
		icon: getVariableType( variables[ id ].type ).icon,
		startIcon: getVariableType( variables[ id ].type ).startIcon,
	} ) );

	const tableSX: SxProps = {
		minWidth: 250,
		tableLayout: 'fixed',
	};

	return (
		<TableContainer sx={ { overflow: 'initial' } }>
			<Table sx={ tableSX } aria-label="Variables manager list with drag and drop reordering">
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
												<Stack direction="row" alignItems="center" gap={ 1 }>
													{ createElement( row.icon, { fontSize: 'inherit' } ) }
													<EllipsisWithTooltip title={ row.name }>
														{ row.name }
													</EllipsisWithTooltip>
												</Stack>
											</VariableTableCell>
											<VariableTableCell>
												<Stack direction="row" alignItems="center" gap={ 1 }>
													{ row.startIcon && row.startIcon( { value: row.value } ) }

													<EllipsisWithTooltip title={ row.value }>
														{ row.value }
													</EllipsisWithTooltip>
												</Stack>
											</VariableTableCell>
											<VariableTableCell
												align="right"
												noPadding
												width={ 16 }
												maxWidth={ 16 }
												sx={ { pr: 1 } }
											>
												<Stack role="toolbar" direction="row" justifyContent="flex-end">
													<VariableMenu menuActions={ menuActions } disabled={ isSorting } />
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
