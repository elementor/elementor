import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Heading from '../../ui/heading/heading';
import Text from '../../ui/text/text';
import Grid from 'elementor-app/ui/grid/grid';
import Button from 'elementor-app/ui/molecules/button';

import './export-success.scss';

export default function ExportSuccess() {
	return (
		<Layout type="export">
			<section className="e-app-export-success">
				<Message>
					<Heading size="xl">
						{ __( 'Your Kit Was Exported Successfully!', 'elementor' ) }
					</Heading>

					<Text size="md">
						{ __( 'Use this exported Kit on another Elementor site by uploading it via Kit Manager > Import Kit', 'elementor' ) }
					</Text>

					<Text tag="span" size="sm">
						{ __( 'If the download doesn\'t start automatically, please', 'elementor' ) }
					</Text>
					<Button text={ __( 'click here', 'elementor' ) } url="/#" />
				</Message>

				<Grid container justify="center" className="e-app-export-success__learn-more">
					<Button size="md" text={ __( 'Learn More', 'elementor' ) } url="/#" />
				</Grid>
			</section>
		</Layout>
	);
}

