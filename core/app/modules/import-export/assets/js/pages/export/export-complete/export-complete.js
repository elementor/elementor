import { useContext, useEffect } from 'react';

import { Context } from '../../../context/export/export-context';

import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import WizardFooter from 'elementor-app/organisms/wizard-footer';
import DashboardButton from 'elementor-app/molecules/dashboard-button';
import KitData from './components/kit-data';

import './export-complete.scss';

export default function ExportComplete() {
	const exportContext = useContext( Context ),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<DashboardButton />
			</WizardFooter>
		),
		downloadFile = () => {
			const link = document.createElement( 'a' );

			link.href = 'data:text/plain;base64,' + exportContext.data.fileResponse.file;
			link.download = 'elementor-kit.zip';

			link.click();
		},
		getDownloadLink = () => (
			<InlineLink url={ exportContext.data.downloadUrl } target="_parent" italic>
				{ __( 'Click Here', 'elementor' ) }
			</InlineLink>
		);

	useEffect( () => {
		if ( exportContext.data.downloadUrl ) {
			downloadFile();
		}
	}, [ exportContext.data.downloadUrl ] );

	return (
		<Layout type="export" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				heading={ __( 'Your export is ready!', 'elementor' ) }
				description={ __( 'Now you can import this kit and use it on other sites.', 'elementor' ) }
				notice={ (
					<>
						{ __( 'Download not working?', 'elementor' ) } { getDownloadLink() } { __( 'to download', 'elementor' ) }
					</>
				) }
			>
				<KitData />
			</WizardStep>
		</Layout>
	);
}
