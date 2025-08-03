import * as React from 'react';
import { UnstableSortableProvider, UnstableSortableItem } from '@elementor/ui/unstable';
import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, usePopupState, Menu, MenuItem, bindTrigger, bindMenu } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useVariables } from '../../hooks/use-prop-variables';
import { DotsVerticalIcon, GridDotsIcon } from '@elementor/icons';
import { SortableItemRenderProps } from '@elementor/ui/unstable/components/SortableItem';

export const VariablesManagerList = () => {
    const variables = useVariables();
    const rows = [...Object.entries( variables )].map( ( [ key, variable ] ) => ({
        id: key,
        name: variable.label,
        value: variable.value,
        type: variable.type,
    }));
    const rowOptionsState = usePopupState( {
		variant: 'popover',
	} );

    return (
        <TableContainer>
			<Table aria-label="sortable table">
				<TableHead>
					<TableRow>
						<TableCell padding="none" sx={ { width: 30 } } />
						<TableCell>{ __( 'Name', 'elementor' ) }</TableCell>
						<TableCell align="right">{ __( 'Value', 'elementor' ) }</TableCell>
						<TableCell padding="none" sx={ { width: 50 } } />
					</TableRow>
				</TableHead>
				<TableBody>
					<UnstableSortableProvider
						value={ rows.map( ( row ) => row.id ) }
						onChange={ () => {} }
						variant="static"
						restrictAxis
						dragOverlay={ ( { children: dragOverlayChildren, ...dragOverlayProps } ) => (
							<Table { ...dragOverlayProps }>
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
								}: SortableItemRenderProps ) => {
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
											<TableCell padding="none" sx={ { width: 30 } }>
												<IconButton
													size="small"
													ref={ setTriggerRef }
													{ ...triggerProps }
													disabled={ isSorting }
												>
													<GridDotsIcon fontSize="inherit" />
												</IconButton>
											</TableCell>
											<TableCell component="th" scope="row">
												{ row.name }
											</TableCell>
											<TableCell align="right">{ row.value }</TableCell>
											<TableCell align="right" padding="none" sx={ { width: 50 } }>
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
													<MenuItem>Option 1</MenuItem>
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