import { useContext } from 'react';

import { Context } from '../../../context/export/export-context';

import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import InfoLink from '../../../ui/info-link/info-link';
import WizardFooter from 'elementor-app/organisms/wizard-footer';
import DashboardButton from 'elementor-app/molecules/dashboard-button';

export default function ExportComplete() {
	const exportContext = useContext( Context ),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<DashboardButton />
			</WizardFooter>
		),
		getDownloadLink = () => (
			<InfoLink
				text={ __( 'Click Here', 'elementor' ) }
				url={ exportContext.data.downloadURL }
				target="_self"
			/>
		);

	return (
		<Layout type="export" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				title={ __( 'Thanks For Exporting', 'elementor' ) }
				text={ __( 'This may take a few moments to complete.', 'elementor' ) }
				bottomText={ (
					<>
						{ __( 'Download not working?', 'elementor' ) } { getDownloadLink() } { __( 'to dawnload', 'elementor' ) }
					</>
				) }
			/>
		</Layout>
	);
}
