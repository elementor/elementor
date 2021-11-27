import React, { useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import KitContent from '../../../shared/kit-content/kit-content';
import Notice from 'elementor-app/ui/molecules/notice';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import ImportButton from './components/import-button/import-button';

import './import-content.scss';

export default function ImportContent() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		isAllRequiredPluginsSelected = () => {
			const { plugins, requiredPlugins } = context.data;

			return requiredPlugins.length === plugins.length;
		},
		getFooter = () => (
			<WizardFooter separator justify="end">
				<Button
					text={ __( 'Previous', 'elementor' ) }
					variant="contained"
					onClick={ () => {
						navigate( 'import/plugins/' );
						// context.dispatch( { type: 'SET_FILE', payload: null } );
					} }
				/>

				<ImportButton />
			</WizardFooter>
		),
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	useEffect( () => {
		if ( ! context.data.file ) {
			navigate( 'import' );
		}
	}, [ context.data.file ] );

	return (
		<Layout type="import" footer={ getFooter() }>
			<section className="e-app-import-content">
				<PageHeader
					heading={ __( 'Import a Template Kit', 'elementor' ) }
					description={ [
						__( 'Choose which Elementor components - templates, content and site settings - to include in your kit.', 'elementor' ),
						<React.Fragment key="description-secondary-line">
							{ __( 'By default, all of your components will be imported.', 'elementor' ) } { getLearnMoreLink() }
						</React.Fragment>,
					] }
				/>

				{
					! isAllRequiredPluginsSelected() &&
					<Notice color="warning" label={ __( 'Required plugins are still missing.', 'elementor' ) } className="e-app-import-content__plugins-notice">
						{ __( 'If you don\'t include them, this kit may not work properly.', 'elementor' ) } <InlineLink url="/import/plugins">{ __( 'Go Back', 'elementor' ) }</InlineLink>
					</Notice>
				}

				<KitContent manifest={ context.data.uploadedData?.manifest } />
			</section>
		</Layout>
	);
}
