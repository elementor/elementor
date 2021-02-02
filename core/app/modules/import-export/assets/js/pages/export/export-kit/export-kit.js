import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ExportButton from './components/export-button/export-button';
import KitContent from './components/kit-content/kit-content';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ExportKit() {
	const getFooter = () => (
			<WizardFooter separator justify="end">
				<ExportButton />
			</WizardFooter>
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
