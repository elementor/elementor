import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Footer from '../../shared/footer/footer';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';

import './export-success.scss';

export default function ExportSuccess() {
	return (
		<Layout type="export">
			<section className="e-app-export-success">
				<Message>
					<Heading variant="xl">
						{ __( 'Your Kit Was Exported Successfully!', 'elementor' ) }
					</Heading>

					<Text variant="md">
						{ __( 'Use this exported Kit on another Elementor site by uploading it via Kit Manager > Import Kit', 'elementor' ) }
					</Text>

					<Text tag="span" variant="sm">
						{ __( 'If the download doesn\'t start automatically, please', 'elementor' ) }
					</Text>
					<Button text={ __( 'click here', 'elementor' ) } url="/#" />
				</Message>

				<Footer justify="center">
					<Button variant="contained" size="md" text={ __( 'Learn More', 'elementor' ) } url="/#" />
				</Footer>
			</section>
		</Layout>
	);
}

