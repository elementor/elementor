import React, { useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ImportContext } from '../../../context/import-context/import-context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ActionsFooter from '../../../shared/actions-footer/actions-footer';
import ImportContentDisplay from './components/import-content-display/import-content-display';
import Button from 'elementor-app/ui/molecules/button';

import useImportActions from '../hooks/use-import-actions';

import './import-content.scss';

export default function ImportContent() {
	const sharedContext = useContext( SharedContext ),
		importContext = useContext( ImportContext ),
		navigate = useNavigate(),
		{ navigateToMainScreen } = useImportActions(),
		{ plugins, requiredPlugins, uploadedData, file, isProInstalledDuringProcess } = importContext.data,
		{ includes } = sharedContext.data,
		isImportAllowed = plugins.length || includes.length,
		isAllRequiredPluginsSelected = requiredPlugins.length === plugins.length,
		handleResetProcess = () => importContext.dispatch( { type: 'SET_FILE', payload: null } ),
		getNextPageUrl = () => {
			if ( includes.includes( 'templates' ) && uploadedData?.conflicts ) {
				return 'import/resolver';
			} else if ( plugins.length ) {
				return 'import/plugins-activation';
			}

			return 'import/process';
		},
		handleNextPage = () => {
			if ( ! isImportAllowed ) {
				return;
			}

			navigate( getNextPageUrl() );
		},
		getFooter = () => (
			<ActionsFooter>
				<Button
					text={ __( 'Previous', 'elementor' ) }
					variant="contained"
					onClick={ () => {
						if ( uploadedData?.manifest.plugins?.length ) {
							navigate( 'import/plugins/' );
						} else {
							handleResetProcess();
						}
					} }
				/>

				<Button
					variant="contained"
					text={ __( 'Import', 'elementor' ) }
					color={ isImportAllowed ? 'primary' : 'disabled' }
					onClick={ handleNextPage }
				/>
			</ActionsFooter>
		);

	// On file change.
	useEffect( () => {
		if ( ! file ) {
			navigateToMainScreen();
		}
	}, [ file ] );

	return (
		<Layout type="import" footer={ getFooter() }>
			<section className="e-app-import-content">
				<PageHeader
					heading={ __( 'Select which parts you want to apply', 'elementor' ) }
					description={ [
						__( 'These are the templates, content and site settings that come with your kit.', 'elementor' ),
						__( "All items are already selected by default. Uncheck the ones you don't want.", 'elementor' ),
					] }
				/>

				<ImportContentDisplay
					manifest={ uploadedData?.manifest }
					hasPro={ isProInstalledDuringProcess }
					hasPlugins={ ! ! requiredPlugins.length }
					isAllRequiredPluginsSelected={ isAllRequiredPluginsSelected }
					onResetProcess={ handleResetProcess }
				/>
			</section>
		</Layout>
	);
}
