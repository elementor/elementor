import Layout from '../../../templates/layout';
import Footer from '../../../ui/footer/footer';
import ImportPluginsList from './import-plugins-list/import-plugins-list';
import Box from 'elementor-app/ui/atoms/box';
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
