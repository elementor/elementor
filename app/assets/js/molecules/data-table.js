import { arrayToClassName } from '../utils/utils';

import Table from 'elementor-app/ui/table/table';

export default function DataTable( {
	className,
	onSelect,
	initialSelected,
	initialDisabled,
	headers,
	layout,
	rows,
	selection,
} ) {
	return (
		<Table
			selection={ selection }
			onSelect={ onSelect }
			initialSelected={ initialSelected }
			initialDisabled={ initialDisabled }
			className={ arrayToClassName( [ 'e-app-data-table', className ] ) }
		>
			{
				! ! headers.length &&
				<Table.Head>
					<Table.Row>
						{
							selection &&
							<Table.Cell tag="th">
								<Table.Checkbox allSelectedCount={ rows.length } />
							</Table.Cell>
						}

						{
							headers.map( ( header, index ) => (
								<Table.Cell tag="th" colSpan={ layout && layout[ index ] } key={ index }>
									{ header }
								</Table.Cell>
							) )
						}
					</Table.Row>
				</Table.Head>
			}

			<Table.Body>
				{
					rows.map( ( row, rowIndex ) => (
						<Table.Row key={ rowIndex }>
							{
								selection &&
								<Table.Cell tag="td">
									<Table.Checkbox index={ rowIndex } />
								</Table.Cell>
							}

							{
								row.map( ( cell, cellIndex ) => (
									<Table.Cell tag="td" colSpan={ layout && layout[ cellIndex ] } key={ cellIndex }>
										{ cell }
									</Table.Cell>
								) )
							}
						</Table.Row>
					) )
				}
			</Table.Body>
		</Table>
	);
}

DataTable.propTypes = {
	className: PropTypes.string,
	headers: PropTypes.array,
	rows: PropTypes.array,
	initialDisabled: PropTypes.array,
	initialSelected: PropTypes.array,
	layout: PropTypes.array,
	onSelect: PropTypes.func,
	selection: PropTypes.bool,
	withHeader: PropTypes.bool,
};

DataTable.defaultProps = {
	className: '',
	headers: [],
	rows: [],
	initialDisabled: [],
	initialSelected: [],
	selection: false,
};

