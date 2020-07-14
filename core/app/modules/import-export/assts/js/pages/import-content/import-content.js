import Layout from '../../templates/layout';
import ImportContentList from './import-content-list/import-content-list';
import Footer from '../../shared/footer/footer';
import Heading from 'elementor-app/ui/atoms/heading';
import Button from 'elementor-app/ui/molecules/button';

export default function ImportContent() {
	return (
		<Layout type="import">
			<section className="e-app-import-content">
				<Heading variant="md">
					{ __( 'Choose The Contents to Include in Your Site', 'elementor' ) }
				</Heading>

				<ImportContentList />

				<Footer separator justify="end">
					<Button variant="contained" color="primary" text={ __( 'Import', 'elementor' ) } url="/import/process" />
				</Footer>
			</section>
		</Layout>
	);
}
