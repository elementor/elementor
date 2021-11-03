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
		<Table selection onChange={ setSelectedData }>
			<Table.Head>
				<Table.Row>
					<Table.Cell tag="th">
						<Table.Checkbox total={2} />
					</Table.Cell>
					<Table.Cell tag="th">Head1</Table.Cell>
					<Table.Cell tag="th">Head2</Table.Cell>
				</Table.Row>
			</Table.Head>

			<Table.Body>
				<Table.Row>
					<Table.Cell tag="td">
						<Table.Checkbox index={ 0 } />
					</Table.Cell>
					<Table.Cell tag="td">Cell 1</Table.Cell>
					<Table.Cell tag="td">Cell 2</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell tag="td">
						<Table.Checkbox index={ 1 } />
					</Table.Cell>
					<Table.Cell tag="td">Cell 1</Table.Cell>
					<Table.Cell tag="td">Cell 2</Table.Cell>
				</Table.Row>
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
