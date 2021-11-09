import { memo } from 'react';

import Table from '../../../ui/table/table';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Icon from 'elementor-app/ui/atoms/icon';

function PluginsTable( props ) {
	const tableHeaders = [ 'Plugin Name', 'Version' ];

	console.log( '### RE-RENDER!!!!!!!! of PluginsTable', props.onSelect );

	return (
		<Table selection onSelect={ props.onSelect } initialSelections={ props.initialSelections } initialDisabled={ props.initialDisabled }>
			{
				props.withHeader &&
				<Table.Head>
					<Table.Row>
						<Table.Cell tag="th">
							<Table.Checkbox allSelectedCount={ props.plugins.length } />
						</Table.Cell>

						{
							tableHeaders.map( ( header, index ) => (
								<Table.Cell tag="th" key={ index }>{ header }</Table.Cell>
							) )
						}
					</Table.Row>
				</Table.Head>
			}

			<Table.Body>
				{
					props.plugins.map( ( plugin, index ) => (
						<Table.Row key={ index }>
							<Table.Cell tag="td">
								<Table.Checkbox index={ index } />
							</Table.Cell>

							<Table.Cell tag="td">
								<Text className="e-app-import-export-plugins-selection__cell-content">
									{ plugin.name }
								</Text>
							</Table.Cell>

							<Table.Cell tag="td">
								<InlineLink underline="none">
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
	initialSelections: PropTypes.array,
	plugins: PropTypes.array,
	withHeader: PropTypes.bool,
};

PluginsTable.defaultProps = {
	initialDisabled: [],
	initialSelections: [],
	plugins: [],
	withHeader: true,
};

export default memo( PluginsTable );
