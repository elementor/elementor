import Layout from '../../templates/layout';
import ImportContentList from './import-content-list/import-content-list';
import Heading from '../../ui/heading/heading';
import MainFooter from '../../shared/main-footer/main-footer';
import Button from 'elementor-app/ui/molecules/button';

export default function ImportContent() {
	return (
		<Layout type="import">
			<section className="e-app-import-content">
				<Heading size="md">
					{ __( 'Choose The Contents to Include in Your Site', 'elementor' ) }
				</Heading>

				<ImportContentList />

				<MainFooter>
					<Button variant="primary" text={ __( 'Import', 'elementor' ) } url="/import/process" />
				</MainFooter>
			</section>
		</Layout>
	);
}
