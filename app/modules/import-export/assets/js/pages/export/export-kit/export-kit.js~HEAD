import React, { useEffect, useContext } from 'react';

import { ExportContext } from '../../../context/export-context/export-context-provider';
import { SharedContext } from '../../../context/shared-context/shared-context-provider';

import { cptObjectToOptionsArray } from '../../../shared/cpt-select-box/cpt-object-to-options-array';
import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import KitContent from '../../../shared/kit-content/kit-content';
import KitInformation from './components/kit-information/kit-information';
import ActionsFooter from '../../../shared/actions-footer/actions-footer';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Button from 'elementor-app/ui/molecules/button';

import kitContentData from '../../../shared/kit-content-data/kit-content-data';

import './export-kit.scss';

export default function ExportKit() {
	const exportContext = useContext( ExportContext ),
	sharedContext = useContext( SharedContext ),
		getFooter = () => (
			<ActionsFooter>
				<Button
					variant="contained"
					text={ __( 'Next', 'elementor' ) }
					color="primary"
					url="/export/plugins"
				/>
			</ActionsFooter>
		),
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	useEffect( () => {
		exportContext.dispatch( { type: 'SET_IS_EXPORT_PROCESS_STARTED', payload: true } );
		sharedContext.dispatch( { type: 'SET_CPT', payload: cptObjectToOptionsArray( elementorAppConfig[ 'import-export' ].summaryTitles.content?.customPostTypes, 'plural' ) } );
	}, [] );

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-kit">
				<PageHeader
					heading={ __( 'Export a Website Kit', 'elementor' ) }
					description={ [
						__( 'Choose which Elementor components - templates, content and site settings - to include in your kit file.', 'elementor' ),
						<React.Fragment key="description-secondary-line">
							{ __( 'By default, all of your components will be exported.', 'elementor' ) } { getLearnMoreLink() }
						</React.Fragment>,
					] }
				/>

				<KitContent contentData={ kitContentData } />

				<KitInformation />
			</section>
		</Layout>
	);
}
