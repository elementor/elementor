import Layout from '../../templates/layout';
import Footer from '../../shared/footer/footer';
import Box from '../../ui/box/box';
import ImportPluginsList from './import-plugins-list/import-plugins-list';
import Button from 'elementor-app/ui/molecules/button';
import Heading from 'elementor-app/ui/atoms/heading';

export default function ImportPlugins() {
	const getFooter = () => (
		<Footer separator justify="end">
			<Button variant="contained" color="primary" text={ __( 'Next', 'elementor' ) } url="/export-plugins" />
		</Footer>
	);

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-plugins">
				<Heading variant="h2">
					{ __( 'Select the Plugins You Want to Suggest for Your Kit', 'elementor' ) }
				</Heading>

				<Box>
					<ImportPluginsList />
				</Box>
			</section>
		</Layout>
	);
}
