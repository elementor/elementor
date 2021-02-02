import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import ClickToDownload from './components/click-to-download/click-to-download';
import WizardFooter from 'elementor-app/organisms/wizard-footer';
import DashboardButton from 'elementor-app/molecules/dashboard-button';

export default function ExportComplete() {
	const getFooter = () => (
		<WizardFooter separator justify="end">
			<DashboardButton />
		</WizardFooter>
	);

	return (
		<Layout type="export" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				title={ __( 'Thanks For Exporting', 'elementor' ) }
				text={ __( 'This may take a few moments to complete.', 'elementor' ) }
				bottomText={ (
					<>
						{ __( 'Download not working?', 'elementor' ) } <ClickToDownload /> { __( 'to dawnload', 'elementor' ) }
					</>
				) }
			/>
		</Layout>
	);
}
