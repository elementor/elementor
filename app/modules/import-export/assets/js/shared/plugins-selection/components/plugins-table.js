import { memo } from 'react';

import DataTable from 'elementor-app/molecules/data-table';

import Text from 'elementor-app/ui/atoms/text';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Icon from 'elementor-app/ui/atoms/icon';

import './plugins-table.scss';

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
		<Text className="e-app-import-export-plugins-table__cell-content">
			{ cellTextProps.text }
		</Text>
		),
		CellLink = ( cellLinkProps ) => (
			<InlineLink url={ cellLinkProps.url } underline="none">
				{ `${ __( 'Version' ) } ${ cellLinkProps.text }` } <Icon className="eicon-editor-external-link" />
			</InlineLink>
		),
		getHeaders = () => {
			if ( ! withHeader ) {
				return [];
			}

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
			className="e-app-import-export-plugins-table"
		/>
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
