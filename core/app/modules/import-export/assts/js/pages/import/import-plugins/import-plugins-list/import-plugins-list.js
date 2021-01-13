import List from 'elementor-app/ui/molecules/list';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Button from 'elementor-app/ui/molecules/button';

import './import-plugins-list.scss';

export default function ImportPluginsList() {
	const pluginsData = [
		{
			name: 'WooCommerce',
			state: 'locked',
		},
		{
			name: 'WPForms',
			state: 'active',
		},
		{
			name: 'Yoast SEO',
			state: 'inactive',
		},
	],
	getLockedButton = () => (
		<Button variant="contained" color="cta" text={ __( 'Get Pro', 'elementor' ) } />
	),
	getActiveIndication = () => (
		<Grid container>
			<Checkbox rounded checked disabled className="import-plugins-list__checkbox" />
			<Text>{ __( 'Activated', 'elementor' ) }</Text>
		</Grid>
	),
	getInstallButton = () => (
		<Button variant="contained" color="disabled" text={ __( 'Install & Activate', 'elementor' ) } />
	);

	return (
		<List separated className="import-plugins-list">
			{
				pluginsData.map( ( plugin, index ) => (
					<List.Item key={ index } className="import-plugins-list__item">
						<Grid container justify="space-between" alignItems="center">
							<Heading variant="h3" className="import-plugins-list__plugin-name">{ plugin.name }</Heading>

							<Grid item>
								{ 'locked' === plugin.state && getLockedButton() }
								{ 'active' === plugin.state && getActiveIndication() }
								{ 'inactive' === plugin.state && getInstallButton() }
							</Grid>
						</Grid>
					</List.Item>
				) )
			}
		</List>
	);
}

ImportPluginsList.propTypes = {
	className: PropTypes.string,
};

ImportPluginsList.defaultProps = {
	className: '',
};
