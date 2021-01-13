import Layout from '../../../templates/layout';
import KitContent from '../../../shared/kit-content/kit-content';
import Footer from '../../../shared/footer/footer';
import Heading from 'elementor-app/ui/atoms/heading';
import Button from 'elementor-app/ui/molecules/button';

export default function ImportContent() {
	const getFooter = () => (
		<Footer separator justify="end">
			<Button variant="contained" color="primary" text={ __( 'Import', 'elementor' ) } url="/import/process" />
		</Footer>
	);

	return (
		<Layout type="import" footer={ getFooter() }>
			<section className="e-app-import-content">
				<Heading variant="h2">
					{ __( 'Choose The Contents to Include in Your Site', 'elementor' ) }
				</Heading>

				<KitContent type="import" />
			</section>
		</Layout>
	);
}
