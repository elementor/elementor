import List from 'elementor-app/ui/molecules/list';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Button from 'elementor-app/ui/molecules/button';

import './export-plugins-list.scss';

export default function ExportPluginsList() {
	const pluginsData = [
		{
			name: 'WooCommerce',
			version: '1.0.0',
			link: 'woocommerce.com',
		},
		{
			name: 'WPForms',
			version: '2.0.0',
			link: 'wpforms.com',
		},
	];
	console.log( '--- RENDER: ExportPluginsList()' );

	return (
		<List separated className="export-plugins-list">
			{
				pluginsData.map( ( plugin, index ) => (
					<List.Item separated padding="10" key={ index } className="export-plugins-list__item">
						<Grid container justify="space-between" alignItems="center">
							<Grid item>
								<Grid container>
									<Checkbox className="export-plugins-list__checkbox" />
									<Heading variant="h3" className="export-plugins-list__plugin-name">{ plugin.name }</Heading>
								</Grid>
							</Grid>

							<Grid item>
								<Text variant="sm" tag="span">{ plugin.version } | { __( 'By', 'elementor' ) }</Text> <Button variant="underlined" color="link" text={ plugin.link } />
							</Grid>
						</Grid>
					</List.Item>
				) )
			}
		</List>
	);
}

ExportPluginsList.propTypes = {
	className: PropTypes.string,
};

ExportPluginsList.defaultProps = {
	className: '',
};
