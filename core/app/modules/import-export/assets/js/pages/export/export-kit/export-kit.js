import React from 'react';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ExportButton from './components/export-button/export-button';
import KitContent from '../../../shared/kit-content/kit-content';
import Panel from '../../../ui/panel/panel';
import Grid from 'elementor-app/ui/grid/grid';
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
					heading={ __( 'Export a Template Kit', 'elementor' ) }
					description={ [
						__( 'Choose which Elementor components - templates, content and site settings - to include in your kit file.', 'elementor' ),
						<React.Fragment key="description-secondary-line">
							{ __( 'By default, all of your components will be exported.', 'elementor' ) } { getLearnMoreLink() }
						</React.Fragment>,
					] }
				/>

				<KitContent />

				<Panel>
					<Panel.Header>
						<Panel.Headline>{ __( 'Kit Information', 'elementor' ) }</Panel.Headline>
					</Panel.Header>

					<Panel.Body>
						<Grid container spacing={20}>
							<Grid item md={4}>
								Column1
							</Grid>

							<Grid item md={4}>
								Column2
							</Grid>

							<Grid item md={4}>
								Column3
							</Grid>
						</Grid>
					</Panel.Body>
				</Panel>
			</section>
		</Layout>
	);
}
