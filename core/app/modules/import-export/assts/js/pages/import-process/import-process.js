import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Heading from '../../ui/heading/heading';
import Text from '../../ui/text/text';
import Box from '../../ui/box/box';
import MainFooter from '../../shared/main-footer/main-footer';
import Button from 'elementor-app/ui/molecules/button';

import './import-process.scss';

export default function ImportProcess() {
	return (
		<Layout type="import">
			<Message className="e-app-import-process">
				<Heading size="lg">
					{ __( 'Your Kit Is Being Imported', 'elementor' ) }
				</Heading>
				<Text size="md">
					{ __( 'This may take a few moments to complete.\nPlease don’t close this window until importing is completed', 'elementor' ) }
				</Text>

				<Box className="e-app-import-process__box">
					{ __( 'Importing global templates', 'elementor' ) }
				</Box>

				<MainFooter>
					<Button variant="disabled" text={ __( 'Cancel', 'elementor' ) } url="/import/process" />
				</MainFooter>
			</Message>
		</Layout>
	);
}
