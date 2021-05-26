import React, { useState } from 'react';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ExportButton from './components/export-button/export-button';
import KitContent from '../../../shared/kit-content/kit-content';
import Panel from '../../../ui/panel/panel';
import Grid from 'elementor-app/ui/grid/grid';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import TextField from 'elementor-app/ui/atoms/text-field';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import ModalProvider from 'elementor-app/ui/modal/modal';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import './export-kit.scss';

export default function ExportKit() {
	const [ isShowInfoPopup, setIsShowInfoPopup ] = useState( false ),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<ExportButton />
			</WizardFooter>
		),
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		),
		getInfoButton = () => {
			const toggleButtonProps = {
				className: 'e-app-export-kit-information__info-icon',
				icon: 'eicon-info-circle',
				text: __( 'Kit Info', 'elementor' ),
				color: 'secondary',
				hideText: true,
			};

			return (
				<ModalProvider toggleButtonProps={ toggleButtonProps } title={ __( 'Export a Template Kit', 'elementor' ) }>
					<ModalProvider.Section>
						<Heading variant="h3" tag="h2">{ __( 'What’s a Template Kit?', 'elementor' ) }</Heading>
						<Text variant="sm">{ __( 'A kit is a zip file containing anything from an entire site to individual components.', 'elementor' ) }</Text>
					</ModalProvider.Section>

					<ModalProvider.Section>
						<Heading variant="h3" tag="h2">{ __( 'How does exporting work?', 'elementor' ) }</Heading>
						<Text variant="xs">
							<>
								{ __( 'Select what to include from your site. We’ll use that to create a zip file.', 'elementor' ) }
								<br />
								{ __( 'That’s it!', 'elementor' ) } <InlineLink>{ __( 'Learn More', 'elementor' ) }</InlineLink>
							</>
						</Text>
					</ModalProvider.Section>

					<ModalProvider.Section>
						<ModalProvider.Tip
							title={ __( 'Tip!', 'elementor' ) }
							description={ __( 'Once your download is complete, import your kit to another site and get it up and running quickly.', 'elementor' ) }
						/>
					</ModalProvider.Section>
				</ModalProvider>
			);
		};

	return (
		<Layout type="export" footer={ getFooter() } headerButtons={ [ getInfoButton() ] }>
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

				<Panel className="e-app-export-kit-information">
					<Panel.Header>
						<Panel.Headline>{ __( 'Kit Information', 'elementor' ) }</Panel.Headline>
					</Panel.Header>

					<Panel.Body>
						<Grid container spacing={20}>
							<Grid item md={4}>
								<Grid container direction="column">
									<Grid className="e-app-export-kit-information__field-header" container alignItems="center">
										<Heading className="e-app-export-kit-information__label" variant="h6" tag="h4">
											{ __( 'Kit Name', 'elementor' ) }
										</Heading>

										{ getInfoButton() }
									</Grid>

									<Grid item>
										<TextField placeholder={ __( 'Elementor Kit', 'elementor' ) } />
									</Grid>
								</Grid>
							</Grid>

							<Grid item md={4}>
								<Grid className="e-app-export-kit-information__field-header" container alignItems="center">
									<Heading className="e-app-export-kit-information__label" variant="h6" tag="h4">
										{ __( 'Kit Description', 'elementor' ) }
									</Heading>

									{ getInfoButton() }
								</Grid>

								<Grid item>
									<TextField placeholder={ __( 'Say something about the style and content of these files...', 'elementor' ) } multiline rows={5} />
								</Grid>
							</Grid>
						</Grid>
					</Panel.Body>
				</Panel>
			</section>
		</Layout>
	);
}
