import React, { useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { ImportContext } from '../../../context/import-context/import-context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ConflictList from './components/conflict/conflict-list';
import ActionsFooter from '../../../shared/actions-footer/actions-footer';
import Panel from 'elementor-app/ui/panel/panel';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Button from 'elementor-app/ui/molecules/button';

import './import-resolver.scss';

export default function ImportResolver() {
	const importContext = useContext( ImportContext ),
		navigate = useNavigate(),
		getFooter = () => (
			<ActionsFooter>
				<Button
					text={ __( 'Previous', 'elementor' ) }
					variant="contained"
					onClick={ () => navigate( 'import/content' ) }
				/>

				<Button
					text={ __( 'Next', 'elementor' ) }
					variant="contained"
					color="primary"
					onClick={ () => {
						const url = importContext.data.plugins.length ? 'import/plugins-activation' : 'import/process';
						importContext.dispatch( { type: 'SET_IS_RESOLVED', payload: true } );
						navigate( url );
					} }
				/>
			</ActionsFooter>
		),
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	useEffect( () => {
		if ( ! importContext.data.uploadedData ) {
			navigate( 'import' );
		}
	}, [] );

	return (
		<Layout type="import" footer={ getFooter() }>
			<section className="e-app-import-resolver">
				<PageHeader
					heading={ __( 'Import a Template Kit to your site', 'elementor' ) }
					description={ [
						<React.Fragment key="description-first-line">
							{ __( 'Parts of this kit overlap with your site’s templates, design and settings. The items you leave checked on this list will replace your current design.', 'elementor' ) } { getLearnMoreLink() }
						</React.Fragment>,
					] }
				/>

				<Panel isOpened={ true }>
					<Panel.Header toggle={ false }>
						<Panel.Headline>{ __( 'Select the items you want to keep and apply:', 'elementor' ) }</Panel.Headline>
					</Panel.Header>

					<Panel.Body padding="20">
						<ConflictList />
					</Panel.Body>
				</Panel>
			</section>
		</Layout>
	);
}
