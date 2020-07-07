import Layout from '../../templates/layout';
import Heading from '../../ui/heading/heading';
import Box from '../../ui/box/box';
import ExportContentList from './export-content-list/export-content-list';
import MainFooter from '../../shared/main-footer/main-footer';
import Button from 'elementor-app/ui/molecules/button';

import '../import-export.scss';
import './export.scss';

export default function Export() {
	return (
		<Layout type="export">
			<section className="e-app-export">
				<div className="e-app-export__kit-name">
					<Heading size="lg">
						{ __( 'Kit Name', 'elementor' ) }
					</Heading>
					<Box>
						<input type="text" defaultValue="Elementor cloud site" />
					</Box>
				</div>

				<div className="e-app-export__kit-content">
					<Heading size="lg">
						{ __( 'Choose What To Include In The Kit', 'elementor' ) }
					</Heading>
					<ExportContentList />
				</div>

				<MainFooter>
					<Button size="lg" variant="primary" text={ __( 'Next', 'elementor' ) } url="/export/success" />
				</MainFooter>
			</section>
		</Layout>
	);
}

