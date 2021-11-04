import { useState, useEffect, useRef } from 'react';
import Table from '../../ui/table/table';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './plugins-selection.scss';

const ELEMENTOR_PLUGIN_NAME = 'Elementor',
	ELEMENTOR_PRO_PLUGIN_NAME = 'Elementor Pro';

export default function PluginsSelection( props ) {
	const hasPro = false;

	const [ selectedData, setSelectedData ] = useState( null ),
		elementorPluginsNames = [ ELEMENTOR_PLUGIN_NAME, ELEMENTOR_PRO_PLUGIN_NAME ],
		elementorPluginsData = {},
		plugins = [ ...props.plugins ].filter( ( data ) => {
			const isElementorPlugin = elementorPluginsNames.includes( data.name );

			if ( isElementorPlugin ) {
				elementorPluginsData[ data.name ] = data;
			}

			return ! isElementorPlugin;
		} ),
		data = {
			headers: [ 'Plugin Name', 'Version' ],
		};

	if ( elementorPluginsData[ ELEMENTOR_PRO_PLUGIN_NAME ] ) {
		plugins.unshift( elementorPluginsData[ ELEMENTOR_PRO_PLUGIN_NAME ] );
	}

	useEffect( () => {
		console.log( 'props.plugins', props.plugins );
	}, [ props.plugins ] );

	useEffect( () => {
		if ( selectedData ) {
			const corePluginData = elementorPluginsData[ ELEMENTOR_PLUGIN_NAME ],
				selectedPluginsData = [ corePluginData ];

			selectedData.map( ( pluginIndex ) => selectedPluginsData.push( plugins[ pluginIndex ] ) );

			console.log( selectedPluginsData );
		}
	}, [ selectedData ] );

	if ( ! props.plugins.length ) {
		return null;
	}

	return (
		<Table selection onSelect={ setSelectedData }>
			<Table.Head>
				<Table.Row>
					<Table.Cell tag="th">
						<Table.Checkbox allSelectedCount={ plugins.length } />
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
					hasPro &&
					<Table.Row key={ index }>
						<Table.Cell tag="td">
							<Table.Checkbox index={ index } />
						</Table.Cell>

						<Table.Cell tag="td">
							<Text className="e-app-import-export-plugins-selection__cell-content">
								{ ELEMENTOR_PRO_PLUGIN_NAME }
							</Text>
						</Table.Cell>

						<Table.Cell tag="td">Version { plugin.version }</Table.Cell>
					</Table.Row>
				}
				{
					plugins.map( ( plugin, index ) => (
						<Table.Row key={ index }>
							<Table.Cell tag="td">
								<Table.Checkbox index={ index } />
							</Table.Cell>

							<Table.Cell tag="td">
								<Text className="e-app-import-export-plugins-selection__cell-content">
									{ plugin.name }
								</Text>
							</Table.Cell>

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
