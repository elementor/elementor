import Layout from '../../templates/layout';
import Box from '../../ui/box/box';
import ExportContentList from './export-content-list/export-content-list';
import Footer from '../../shared/footer/footer';
import Heading from 'elementor-app/ui/atoms/heading';
import Button from 'elementor-app/ui/molecules/button';

import '../import-export.scss';
import './export.scss';

export default function Export() {
	return (
		<Layout type="export">
			<section className="e-app-export">
				<div className="e-app-export__kit-name">
					<Heading variant="lg">
						{ __( 'Kit Name', 'elementor' ) }
					</Heading>
					<Box>
						<input type="text" defaultValue="Elementor cloud site" />
					</Box>
				</div>

				<div className="e-app-export__kit-content">
					<Heading variant="lg">
						{ __( 'Choose What To Include In The Kit', 'elementor' ) }
					</Heading>
					<ExportContentList />
				</div>

				<Footer separator justify="end">
					<Button size="lg" color="primary" text={ __( 'Next', 'elementor' ) } url="/export/success" />
				</Footer>
			</section>
		</Layout>
	);
}

