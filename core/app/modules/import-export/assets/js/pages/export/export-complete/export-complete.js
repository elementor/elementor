import Layout from '../../../templates/layout';
import Message from '../../../ui/message/message';
import Footer from '../../../shared/footer/footer';
import ClickToDownload from './components/click-to-download/click-to-download';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';

import './export-complete.scss';

export default function ExportComplete() {
	const getFooter = () => (
		<Footer separator justify="end">
			<Button
				variant="contained"
				size="lg"
				text={ __( 'Back to dashboard', 'elementor' ) }
				color="primary"
				url="#"
			/>
		</Footer>
	);

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-complete">
				<Message>
					<img className="e-app-export-complete__main-image" src={ elementorAppConfig.assets_url + 'images/go-pro.svg' } />

					<Heading variant="display-3" className="e-app-export-complete__message-title">
						{ __( 'Thanks for exporting', 'elementor' ) }
					</Heading>

					<Text variant="xl" className="e-app-export-complete__message-line" >
						{ __( 'This may take a few moments to complete.', 'elementor' ) }
					</Text>

					<Text tag="span" variant="xs" className="e-app-export-complete__message-line">
						{ __( 'Download not working?', 'elementor' ) } <ClickToDownload /> { __( 'to dawnload', 'elementor' ) }
					</Text>
				</Message>
			</section>
		</Layout>
	);
}

