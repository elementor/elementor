import React, { useState, useEffect, useContext } from 'react';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import KitContent from '../../../shared/kit-content/kit-content';
import KitName from './components/kit-name/kit-name';
import KitDescription from './components/kit-description/kit-description';
import KitInfoModal from './components/kit-info-modal/kit-info-modal';
import Panel from 'elementor-app/ui/panel/panel';
import Grid from 'elementor-app/ui/grid/grid';
import Heading from 'elementor-app/ui/atoms/heading';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import './export-kit.scss';

export default function ExportKit() {
	const context = useContext( Context ),
		[ showKitInfoModal, setShowKitInfoModal ] = useState( false ),
		kitInfoTitle = __( 'Kit Information', 'elementor' ),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<Button
					variant="contained"
					text={ __( 'Next', 'elementor' ) }
					color="primary"
					url="/export/plugins"
				/>
			</WizardFooter>
		),
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	useEffect( () => {
		context.dispatch( { type: 'SET_IS_EXPORT_PROCESS_STARTED', payload: true } );
	}, [] );

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

				<Panel className="e-app-export-kit-information">
					<Panel.Header>
						<Panel.Headline>
							{ kitInfoTitle }
							<Button
								className="e-app-export-kit-info-modal__icon"
								icon="eicon-info-circle"
								color="secondary"
								hideText={ true }
								text={ kitInfoTitle }
								onClick={ ( event ) => {
									event.stopPropagation();
									setShowKitInfoModal( ( prevState ) => ! prevState );
								} }
							/>
						</Panel.Headline>
					</Panel.Header>

					<Panel.Body>
						<Grid container spacing={20}>
							<Grid item md={4}>
								<Grid container direction="column">
									<Grid className="e-app-export-kit-information__field-header" container alignItems="center">
										<Heading className="e-app-export-kit-information__label" variant="h6" tag="h4">
											{ __( 'Kit Name', 'elementor' ) }
										</Heading>
									</Grid>

									<Grid item>
										<KitName />
									</Grid>
								</Grid>
							</Grid>

							<Grid item md={4}>
								<Grid className="e-app-export-kit-information__field-header" container alignItems="center">
									<Heading className="e-app-export-kit-information__label" variant="h6" tag="h4">
										{ __( 'Kit Description', 'elementor' ) }
									</Heading>
								</Grid>

								<Grid item>
									<KitDescription />
								</Grid>
							</Grid>
						</Grid>
					</Panel.Body>
				</Panel>

				<KitInfoModal show={ showKitInfoModal } setShow={ setShowKitInfoModal } />
			</section>
		</Layout>
	);
}
