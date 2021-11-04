import { useState, useEffect } from 'react';
import Table from '../../ui/table/table';

export default function PluginsSelection( props ) {
	const [ selectedData, setSelectedData ] = useState( null ),
		data = {
		onChange: setSelectedData,
		selection: true,
		headers: [ 'Head1', 'Head3' ],
		rows: [
			{
				id: 'settings',
				columns: [ 'Setting2', 'Setting2' ],
			},
			{
				id: 'templates',
				columns: [ 'fgefdgdgf', 'Template2' ],
			},
			{
				id: 'content',
				columns: [ 'fgdfg', 'Content2' ],
			},
		],
	};

	useEffect( () => {
		if ( selectedData ) {
			console.log( selectedData );
		}
	}, [ selectedData ] );

	return (
		<Table selection onSelect={ setSelectedData }>
			<Table.Head>
				<Table.Row>
					<Table.Cell tag="th">
						<Table.Checkbox allSelectedCount={ data.rows.length } />
					</Table.Cell>

					{
						data.headers.map( ( header, index ) => (
							<Table.Cell tag="th" key={ index }>{ header }</Table.Cell>
						) )
					}
				</Table.Row>
			</Table.Head>

			<Table.Body>
				{
					data.rows.map( ( row, index ) => (
						<Table.Row key={ index }>
							<Table.Cell tag="td">
								<Table.Checkbox index={ index } />
							</Table.Cell>

							{
								row.columns.map( ( cell, cellIndex ) => (
									<Table.Cell tag="td" key={ cellIndex }>{ cell }</Table.Cell>
								) )
							}
						</Table.Row>
					) )
				}
			</Table.Body>
		</Table>
	);
}

PluginsSelection.propTypes = {
	selection: PropTypes.bool,
};

PluginsSelection.defaultProps = {
	selection: true,
};
