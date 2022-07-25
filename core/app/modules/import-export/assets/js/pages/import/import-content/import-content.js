import React, { useContext, useEffect } from 'react';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ImportContext } from '../../../context/import-context/import-context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ImportContentDisplay from './components/import-content-display/import-content-display';
import ImportContentFooter from './components/import-content-footer/import-content-footer';

import useImportActions from '../hooks/use-import-actions';

import './import-content.scss';
import { eventTrackingDispatch } from 'elementor-app/event-track/events';

export default function ImportContent() {
	const sharedContext = useContext( SharedContext ),
		importContext = useContext( ImportContext ),
		{ referrer, includes, wizardStepNum } = sharedContext.data,
		{ plugins, requiredPlugins, uploadedData, file, isProInstalledDuringProcess } = importContext.data,
		{ navigateToMainScreen } = useImportActions(),
		handleResetProcess = () => importContext.dispatch( { type: 'SET_FILE', payload: null } ),

		getFooter = () => {
			return (
				<ImportContentFooter
					hasPlugins={ ! ! plugins.length }
					hasConflicts={ ! ! ( includes.includes( 'templates' ) && uploadedData?.conflicts ) }
					isImportAllowed={ ! ! ( plugins.length || includes.length ) }
					onResetProcess={ handleResetProcess }
					onPreviousClick={ () => eventTrackingDispatch(
						'kit-library/go-back',
						{
							source: 'import',
							step: wizardStepNum,
							event: 'previous button',
						},
					) }
					onImportClick={ () => eventTrackingDispatch(
						'kit-library/approve-import',
						{
							source: 'import',
							step: wizardStepNum,
							event: 'approve-import',
						},
					) }
				/>
			);
		};

	useEffect( () => {
		if ( 'kit-library' === referrer && ! wizardStepNum ) {
			sharedContext.dispatch( { type: 'SET_WIZARD_STEP_NUM', payload: 1 } );
		}
	}, [] );
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
					isAllRequiredPluginsSelected={ requiredPlugins.length === plugins.length }
					onResetProcess={ handleResetProcess }
				/>
			</section>
		</Layout>
	);
}
