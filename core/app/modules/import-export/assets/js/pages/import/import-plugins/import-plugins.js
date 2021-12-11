import React, { useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import PluginsToImport from './components/plugins-to-import/plugins-to-import';
import ExistingPlugins from './components/existing-plugins/existing-plugins';
import ProBanner from './components/pro-banner/pro-banner';
import ImportPluginsFooter from './components/import-plugins-footer/import-plugins-footer';
import Loader from '../../../ui/loader/loader';

import Notice from 'elementor-app/ui/molecules/notice';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

import useImportPluginsData from '../../../hooks/use-import-plugins-data';

import './import-plugins.scss';

export default function ImportPlugins() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		kitPlugins = context.data.uploadedData?.manifest?.plugins || [],
		{ plugins } = useImportPluginsData( kitPlugins ),
		handleRequiredPlugins = () => {
			const { missing, proData } = plugins,
				requiredPlugins = [ ...missing ];

			if ( proData && 'active' !== proData.status ) {
				requiredPlugins.unshift( proData );
			}

			if ( requiredPlugins.length ) {
				context.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: requiredPlugins } );
			} else {
				// In case there are not required plugins just skipping to the next screen.
				navigate( 'import/content' );
			}
		};

	// On load.
	useEffect( () => {
		if ( ! kitPlugins.length ) {
			navigate( 'import/content' );
		}
	}, [] );

	// On plugins data ready.
	useEffect( () => {
		// Saving the required plugins to display them on the next screens.
		if ( plugins && ! context.data.requiredPlugins.length ) {
			handleRequiredPlugins();
		}
	}, [ plugins ] );

	return (
		<Layout type="export" footer={ <ImportPluginsFooter /> }>
			<section className="e-app-import-plugins">
				{ ! plugins && <Loader absoluteCenter />	}

				{
					! ! plugins?.missing.length &&
					<PageHeader
						heading={ __( 'Select the plugins you want to import', 'elementor' ) }
						description={ __( 'These are the plugins that powers up your kit. You can deselect them, but it can impact the functionality of your site.', 'elementor' ) }
					/>
				}

				{
					! ! plugins?.minVersionMissing.length &&
					<Notice label={ __( ' Recommended:', 'elementor' ) } className="e-app-import-plugins__versions-notice" color="warning">
						{ __( 'Please update your plugins before you importing the kit.', 'elementor' ) } <InlineLink>{ __( 'Show me how', 'elementor' ) }</InlineLink>
					</Notice>
				}

				{ plugins?.proData && <ProBanner status={ plugins.proData.status } /> }

				<PluginsToImport plugins={ plugins?.missing } />

				<ExistingPlugins plugins={ plugins?.existing } />
			</section>
		</Layout>
	);
}
