import React from 'react';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ExportButton from './components/export-button/export-button';
import KitContent from './components/kit-content/kit-content';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ExportKit() {
	const getFooter = () => (
			<WizardFooter separator justify="end">
				<ExportButton />
			</WizardFooter>
		),
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-kit">
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
