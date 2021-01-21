import Layout from '../../../templates/layout';
import Message from '../../../ui/message/message';
import ClickHere from '../../../ui/click-here/click-here';
import Footer from '../../../ui/footer/footer';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';

import './import-success.scss';
import ClickToDownload from "../../export/export-complete/components/click-to-download/click-to-download";
import WizardStep from "../../../ui/wizard-step/wizard-step";

export default function ImportSuccess() {
	const getFooter = () => (
		<Footer separator justify="end">
			<Button
				variant="contained"
				text={ __( 'View Live Site', 'elementor' ) }
				color="primary"
				url="#"
			/>
		</Footer>
	);

	return (
		<Layout type="import" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				title={ __( 'Congrats! Your Kit was Imported Successfully', 'elementor' ) }
				bottomText={ (
					<>
						<ClickHere url="/#" /> { __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }
					</>
				) }
			/>
		</Layout>
	);
}
