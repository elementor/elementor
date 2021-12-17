import { useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ImportContext } from '../../../context/import-context/import-context-provider';

import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import KitData from '../../../shared/kit-data/kit-data';
import Button from 'elementor-app/ui/molecules/button';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import DashboardButton from 'elementor-app/molecules/dashboard-button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import FailedPluginsNotice from './components/failed-plugins-notice/failed-plugins-notice';
import ConnectProNotice from './components/connect-pro-notice/connect-pro-notice';

import useImportedKitData from './hooks/use-imported-kit-data';

export default function ImportComplete() {
	const sharedContext = useContext( SharedContext ),
		importContext = useContext( ImportContext ),
		navigate = useNavigate(),
		{ getTemplates, getContent,	getWPContent, getPlugins } = useImportedKitData(),
		{ activePlugins, failedPlugins } = getPlugins( importContext.data.importedPlugins ),
		{ editElementorHomePageUrl, recentlyEditedElementorPageUrl } = importContext.data.importedData?.configData || {},
		seeItLiveUrl = editElementorHomePageUrl || recentlyEditedElementorPageUrl || null,
		getFooter = () => (
			<WizardFooter separator justify="end">
				{
					seeItLiveUrl &&
					<Button
						text={ __( 'See it live', 'elementor' ) }
						variant="contained"
						onClick={ () => window.open( seeItLiveUrl, '_blank' ) }
					/>
				}

				<DashboardButton text={ __( 'Close', 'elementor' ) } />
			</WizardFooter>
		),
		getKitData = () => {
			if ( ! importContext.data.uploadedData || ! importContext.data.importedData ) {
				return {};
			}

			const manifest = importContext.data.uploadedData.manifest,
				importedData = importContext.data.importedData;

			return {
				templates: getTemplates( manifest.templates, importedData ),
				content: getContent( manifest.content, importedData ),
				'wp-content': getWPContent( manifest[ 'wp-content' ], importedData ),
				'site-settings': sharedContext.data.includes.includes( 'settings' ) ? manifest[ 'site-settings' ] : {},
				plugins: activePlugins,
				configData: importedData.configData,
			};
		};

	useEffect( () => {
		if ( ! importContext.data.uploadedData ) {
			navigate( '/import' );
		}
	}, [] );

	return (
		<Layout type="import" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				heading={ __( 'Your kit is now live on your site!', 'elementor' ) }
				description={ __( 'You’ve imported and applied the following to your site:', 'elementor' ) }
				notice={ (
					<>
						<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
							{ __( 'Click Here', 'elementor' ) }
						</InlineLink> { __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }
					</>
				) }
			>
				{ ! ! failedPlugins.length && <FailedPluginsNotice failedPlugins={ failedPlugins } /> }

				{ importContext.data.isProInstalledDuringProcess && <ConnectProNotice /> }

				<KitData data={ getKitData() } />
			</WizardStep>
		</Layout>
	);
}
