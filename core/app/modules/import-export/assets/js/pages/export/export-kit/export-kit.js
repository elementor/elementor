import React from 'react';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import InfoLink from '../../../ui/info-link/info-link';
import ExportButton from './components/export-button/export-button';
import KitContent from './components/kit-content/kit-content';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ExportKit() {
	const getFooter = () => (
			<WizardFooter separator justify="end">
				<ExportButton />
			</WizardFooter>
		),
		getLearnMoreLink = () => (
			<InfoLink
				text={ __( 'Learn More', 'elementor' ) }
				url="https://go.elementor.com/app-what-are-kits"
			/>
		);

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export">
				<PageHeader
					heading={ __( 'Export Kits', 'elementor' ) }
					description={ [
						__( 'Choose which Elementor components - pages, site settings, headers, etc. - to include in your kit file.', 'elementor' ),
						<React.Fragment key="description-secondary-line">
							{ __( 'By default, all of your components will be exported.', 'elementor' ) } { getLearnMoreLink() }
						</React.Fragment>,
					] }
				/>

				<KitContent />
			</section>
		</Layout>
	);
}
