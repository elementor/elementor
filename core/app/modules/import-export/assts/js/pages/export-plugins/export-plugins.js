import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Footer from '../../shared/footer/footer';
import Box from '../../ui/box/box';
import ExportPluginsList from './export-plugins-list/export-plugins-list';
import Button from 'elementor-app/ui/molecules/button';
import Heading from 'elementor-app/ui/atoms/heading';

export default function ExportPlugins() {
	const getFooter = () => (
		<Footer separator justify="end">
			<Button variant="contained" color="primary" text={ __( 'Next', 'elementor' ) } url="/export-plugins" />
		</Footer>
	);

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-plugins">
				<Heading variant="h2">
					{ __( 'Choose The Contents to Include in Your Site', 'elementor' ) }
				</Heading>

				<Box>
					<ExportPluginsList />
				</Box>
			</section>
		</Layout>
	);
}
