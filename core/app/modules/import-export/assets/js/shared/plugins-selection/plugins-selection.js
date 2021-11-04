import { useState, useEffect } from 'react';
import Table from '../../ui/table/table';

export default function PluginsSelection( props ) {
	const [ selectedData, setSelectedData ] = useState( null ),
		data = {
		onChange: setSelectedData,
		selection: true,
		headers: [ 'Plugin Name', 'Version' ],
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
		console.log( 'props.plugins', props.plugins );
	}, [ props.plugins ] );

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
					props.plugins.map( ( plugin, index ) => (
						<Table.Row key={ index }>
							<Table.Cell tag="td">
								<Table.Checkbox index={ index } />
							</Table.Cell>

							<Table.Cell tag="td">{ plugin.name }</Table.Cell>

							<Table.Cell tag="td">Version { plugin.version }</Table.Cell>
						</Table.Row>
					) )
				}
			</Table.Body>
		</Table>
	);
}

PluginsSelection.propTypes = {
	plugins: PropTypes.array,
	selection: PropTypes.bool,
};

PluginsSelection.defaultProps = {
	plugins: [],
	selection: true,
};
