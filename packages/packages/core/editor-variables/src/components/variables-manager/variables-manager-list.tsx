import * as React from 'react';
import { createElement, useState } from 'react';
import { DotsVerticalIcon, GridDotsIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	IconButton,
	Menu,
	MenuItem,
	type SvgIconProps,
	type SxProps,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	UnstableSortableItem,
	type UnstableSortableItemRenderProps,
	UnstableSortableProvider,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useVariables } from '../../hooks/use-prop-variables';
import { getVariableType } from '../../variables-registry/variable-type-registry';

type VariableManagerMenuAction = {
	name: string;
	icon: React.ForwardRefExoticComponent< Omit< SvgIconProps, 'ref' > & React.RefAttributes< SVGSVGElement > >;
	color: string;
	onClick: () => void;
};

type Props = {
	menuActions: VariableManagerMenuAction[];
};

export const VariablesManagerList = ( { menuActions }: Props ) => {
	const variables = useVariables();

	const [ ids, setIds ] = useState< string[] >( Object.keys( variables ) );
	const rows = ids.map( ( id ) => ( {
		id,
		name: variables[ id ].label,
		value: variables[ id ].value,
		type: variables[ id ].type,
		icon: getVariableType( variables[ id ].type ).icon,
		startIcon: getVariableType( variables[ id ].type ).startIcon,
	} ) );

	const rowOptionsState = usePopupState( {
		variant: 'popover',
	} );
	const tableSX: SxProps = {
		minWidth: 300,
	};
	const tableCellSX: SxProps = {
		padding: '6px',
	};

	return (
		<TableContainer>
			<Table sx={ tableSX } aria-label="sortable table">
				<TableHead>
					<TableRow>
						<TableCell padding="none" sx={ { width: 10 } } />
						<TableCell sx={ tableCellSX }>{ __( 'Name', 'elementor' ) }</TableCell>
						<TableCell sx={ tableCellSX }>{ __( 'Value', 'elementor' ) }</TableCell>
						<TableCell padding="none" sx={ { width: 10 } } />
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
											} }
											style={ { ...itemStyle, ...triggerStyle } }
											disableDivider={ isDragOverlay || index === rows.length - 1 }
										>
											<TableCell padding="none" sx={ { width: 10 } }>
												<IconButton
													size="small"
													ref={ setTriggerRef }
													{ ...triggerProps }
													disabled={ isSorting }
												>
													<GridDotsIcon fontSize="inherit" />
												</IconButton>
											</TableCell>
											<TableCell sx={ tableCellSX }>
												{ createElement( row.icon, { fontSize: 'inherit' } ) } { row.name }
											</TableCell>
											<TableCell sx={ tableCellSX }>
												{ row.startIcon && row.startIcon( { value: row.value } ) }
												{ row.value }
											</TableCell>
											<TableCell align="right" padding="none" sx={ { width: 10 } }>
												<IconButton
													{ ...bindTrigger( rowOptionsState ) }
													disabled={ isSorting }
													size="tiny"
												>
													<DotsVerticalIcon fontSize="tiny" />
												</IconButton>

												<Menu
													MenuListProps={ {
														dense: true,
													} }
													{ ...bindMenu( rowOptionsState ) }
													anchorEl={ rowOptionsState.anchorEl }
													open={ rowOptionsState.isOpen }
													onClose={ rowOptionsState.close }
												>
													{ menuActions.map( ( action ) => (
														<MenuItem
															key={ action.name }
															onClick={ action.onClick }
															sx={ { color: action.color } }
														>
															{ action.icon &&
																createElement( action.icon, {
																	fontSize: 'inherit',
																} ) }{ ' ' }
															{ action.name }
														</MenuItem>
													) ) }
												</Menu>
											</TableCell>
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
