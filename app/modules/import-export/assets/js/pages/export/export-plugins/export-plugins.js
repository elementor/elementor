import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ExportContext } from '../../../context/export-context/export-context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

import ExportPluginsSelection from './components/export-plugins-selection/export-plugins-selection';
import ExportPluginsFooter from './components/export-plugins-footer/export-plugins-footer';

import './export-plugins.scss';

export default function ExportPlugins() {
	const sharedContext = useContext( SharedContext ),
		exportContext = useContext( ExportContext ),
		navigate = useNavigate(),
		[ isKitReady, setIsKitReady ] = useState( false ),
		{ plugins, isExportProcessStarted } = exportContext.data || [],
		hasIncludes = ! ! sharedContext.data.includes.length,
		handleOnSelect = useCallback( ( selectedPlugins ) => exportContext.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } ), [] ),
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	// On load.
	useEffect( () => {
		if ( ! isExportProcessStarted ) {
			// When not starting from the main screen.
			navigate( '/export' );
		}
	}, [] );

	// On plugins change.
	useEffect( () => {
		if ( hasIncludes && plugins.length ) {
			// In case that the kit has content and the plugins data exist, then the kit can be exported.
			setIsKitReady( true );
		} else {
			// There should be at least one more plugin select in addition to Elementor Core.
			const isExportKitAllowed = plugins.length > 1;

			// In case that the kit has no content, it can only be exported if there is at least one selected plugin.
			setIsKitReady( isExportKitAllowed );
		}
	}, [ plugins ] );

	return (
		<Layout type="export" footer={ <ExportPluginsFooter isKitReady={ isKitReady } /> }>
			<section className="e-app-export-plugins">
				<PageHeader
					heading={ __( 'Select which plugins to export', 'elementor' ) }
					description={ [
						__( 'Your Website Template may not work as expected if key plugins are missing.', 'elementor' ),
						<React.Fragment key="description-secondary-line">
							{ __( 'By default, we’ll include everything in your file. Uncheck the items you don\'t want.', 'elementor' ) } { getLearnMoreLink() }
						</React.Fragment>,
					] }
				/>

				<ExportPluginsSelection onSelect={ handleOnSelect } />
			</section>
		</Layout>
	);
}
