import { useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from '@reach/router';

import { ExportContext } from '../../../context/export-context/export-context-provider';
import { KIT_SOURCE_MAP } from '../../../hooks/use-kit';

import Layout from '../../../templates/layout';
import ActionsFooter from '../../../shared/actions-footer/actions-footer';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import KitData from '../../../shared/kit-data/kit-data';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Button from 'elementor-app/ui/molecules/button';
import DashboardButton from 'elementor-app/molecules/dashboard-button';

import './export-complete.scss';

export default function ExportComplete() {
	const exportContext = useContext( ExportContext );
	const isSavedToCloud = KIT_SOURCE_MAP.CLOUD === exportContext.data.kitInfo.source;
	const navigate = useNavigate(),
		downloadLink = useRef( null ),
		getFooter = () => (
			<ActionsFooter>
				{ isSavedToCloud
					? (
						<Button
							text={ __( 'Open library', 'elementor' ) }
							variant="contained"
							color="primary"
							url="/kit-library/cloud"
						/>
					)
					: <DashboardButton text={ __( 'Close', 'elementor' ) } />
				}
			</ActionsFooter>
		),
		downloadFile = () => {
			if ( ! downloadLink.current ) {
				const link = document.createElement( 'a' );
				
				const kitName = exportContext.data.kitInfo?.title || 'elementor-kit';
				const sanitizedKitName = kitName
					.replace(/[<>:"/\\|?*]/g, '')
					.trim();
				
				const fileName = sanitizedKitName || 'elementor-kit';

				link.href = 'data:text/plain;base64,' + exportContext.data.exportedData.file;
				link.download = fileName + '.zip';

				downloadLink.current = link;
			}

			downloadLink.current.click();
		};
	const getDownloadLink = () => (
		<InlineLink onClick={ downloadFile } italic>
			{ __( 'Click here', 'elementor' ) }
		</InlineLink>
	);
	const getLearnMoreAboutKitsLink = () => (
		<InlineLink italic>
			{ __( 'Click here', 'elementor' ) }
		</InlineLink>
	);

	useEffect( () => {
		if ( ! exportContext.data.exportedData ) {
			return navigate( '/export' );
		}

		if ( ! isSavedToCloud ) {
			downloadFile();
		}
	}, [ exportContext.data.downloadUrl, isSavedToCloud ] );

	const heading = useMemo( () => {
		return isSavedToCloud
			? __( 'Your kit is now saved to your cloud!', 'elementor' )
			: __( 'Your export is ready', 'elementor' );
	}, [ isSavedToCloud ] );

	const description = useMemo( () => {
		return isSavedToCloud
			? __( 'You\'ve imported and applied the following to your site:', 'elementor' )
			: __( 'Now you can import this kit and use it on other sites.', 'elementor' );
	}, [ isSavedToCloud ] );

	const getNotice = () => (
		isSavedToCloud
			? (
				<>
					{ __( 'Learn more about building your site with Elementor Kits', 'elementor' ) } { getLearnMoreAboutKitsLink() }
				</>

			)
			: (
				<>
					{ __( 'Download not working?', 'elementor' ) } { getDownloadLink() } { __( 'to download', 'elementor' ) }
				</>
			)

	);

	return (
		<Layout type="export" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				heading={ heading }
				description={ description }
				notice={ getNotice() }
			>
				<KitData data={ exportContext.data?.exportedData?.manifest } />
			</WizardStep>
		</Layout>
	);
}
