import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ExportButton from './components/export-button/export-button';
import Footer from '../../../ui/footer/footer';
import KitContent from './components/kit-content/kit-content';

export default function ExportKit() {
	const getFooter = () => (
			<Footer separator justify="end">
				<ExportButton />
			</Footer>
		);

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export">
				<PageHeader
					heading={ __( 'Choose What To Include In The Kit', 'elementor' ) }
					description={ [
						__( 'Choose the kit components to export, such as pages, site setting, headers and more.', 'elementor' ),
						__( 'By default, we will export all the components.', 'elementor' ),
					] }
				/>

				<KitContent />
			</section>
		</Layout>
	);
}
