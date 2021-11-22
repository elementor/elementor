import { memo } from 'react';

import DataTable from 'elementor-app/molecules/data-table';

import Table from 'elementor-app/ui/table/table';
import Text from 'elementor-app/ui/atoms/text';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Icon from 'elementor-app/ui/atoms/icon';

function PluginsTable( {
		plugins,
		layout,
		withHeader,
		withStatus,
		onSelect,
		initialSelected,
		initialDisabled,
	} ) {
	const CellText = ( cellTextProps ) => (
			<Text className="e-app-import-export-plugins-selection__cell-content">
				{ cellTextProps.text }
			</Text>
		),
		CellLink = ( cellLinkProps ) => (
			<InlineLink url={ cellLinkProps.url } underline="none">
				Version { cellLinkProps.text } <Icon className="eicon-editor-external-link" />
			</InlineLink>
		),
		getHeaders = () => {
			const headers = [ 'Plugin Name', 'Version' ];

			if ( withStatus ) {
				headers.splice( 1, 0, 'Status' );
			}

			return headers;
		},
		rows = plugins.map( ( { name, status, version, plugin_uri: pluginUrl } ) => {
			const row = [
				<CellText text={ name } key={ name } />,
				<CellLink text={ version } url={ pluginUrl } key={ name } />,
			];

			if ( withStatus ) {
				row.splice( 1, 0, <CellText text={ status } key={ name } /> );
			}

			return row;
		} );

	return (
		<DataTable
			selection
			headers={ getHeaders() }
			rows={ rows }
			onSelect={ onSelect }
			initialSelected={ initialSelected }
			initialDisabled={ initialDisabled }
			layout={ layout }
			withHeader={ withHeader }
			className="e-app-import-export-plugins-table"
		/>
	);

	return (
		<Table
			selection
			onSelect={ onSelect }
			initialSelected={ initialSelected }
			initialDisabled={ initialDisabled }
			className="e-app-import-export-plugins-table"
		>
			{
				withHeader &&
				<Table.Head>
					<Table.Row>
						<Table.Cell tag="th">
							<Table.Checkbox allSelectedCount={ plugins.length } />
						</Table.Cell>

						{
							tableHeaders.map( ( header, index ) => (
								<Table.Cell tag="th" key={ index } colSpan={ layout && layout[ index ] }>{ header }</Table.Cell>
							) )
						}
					</Table.Row>
				</Table.Head>
			}

			<Table.Body>
				{
					plugins.map( ( plugin, index ) => (
						<Table.Row key={ index }>
							<Table.Cell tag="td">
								<Table.Checkbox index={ index } />
							</Table.Cell>

							<Table.Cell tag="td" colSpan={ layout && layout[ 0 ] }>
								<Text className="e-app-import-export-plugins-selection__cell-content">
									{ plugin.name }
								</Text>
							</Table.Cell>

							{
								withStatus &&
								<Table.Cell tag="td" colSpan={ layout && layout[ 1 ] }>
									<Text className="e-app-import-export-plugins-selection__cell-content">
										{ plugin.status }
									</Text>
								</Table.Cell>
							}

							<Table.Cell tag="td" colSpan={ layout && layout[ layout.length - 1 ] }>
								<InlineLink url={ plugin.plugin_uri } underline="none">
									Version { plugin.version } <Icon className="eicon-editor-external-link" />
								</InlineLink>
							</Table.Cell>
						</Table.Row>
					) )
				}
			</Table.Body>
		</Table>
	);
}

PluginsTable.propTypes = {
	onSelect: PropTypes.func,
	initialDisabled: PropTypes.array,
	initialSelected: PropTypes.array,
	plugins: PropTypes.array,
	withHeader: PropTypes.bool,
	withStatus: PropTypes.bool,
	layout: PropTypes.array,
};

PluginsTable.defaultProps = {
	initialDisabled: [],
	initialSelected: [],
	plugins: [],
	withHeader: true,
	withStatus: true,
};

export default memo( PluginsTable );
