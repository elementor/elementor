import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
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
import { type VariableManagerMenuAction } from './ui/variable-edit-menu';
import { VariableTableCell } from './ui/variable-table-cell';
import { type Row, VariableRow } from './ui/variable-table-row';

type Props = {
	menuActions: VariableManagerMenuAction[];
	variables: TVariablesList;
	onChange: ( variables: TVariablesList ) => void;
	autoEditVariableId?: string;
	onAutoEditComplete?: () => void;
	onFieldError?: ( hasError: boolean ) => void;
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
								render={ ( props: UnstableSortableItemRenderProps ) => (
									<VariableRow
										{ ...props }
										row={ row }
										variables={ variables }
										handleOnChange={ handleOnChange }
										autoEditVariableId={ autoEditVariableId }
										onAutoEditComplete={ onAutoEditComplete }
										onFieldError={ onFieldError }
										menuActions={ menuActions }
										handleRowRef={ handleRowRef }
									/>
								) }
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
