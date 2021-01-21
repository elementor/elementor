import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import Footer from '../../../ui/footer/footer';
import ClickToDownload from './components/click-to-download/click-to-download';
import Button from 'elementor-app/ui/molecules/button';

export default function ExportComplete() {
	const getFooter = () => (
		<Footer separator justify="end">
			<Button
				variant="contained"
				text={ __( 'Back to dashboard', 'elementor' ) }
				color="primary"
				url="#"
			/>
		</Footer>
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

