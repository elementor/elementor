import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Heading from '../../ui/heading/heading';
import Text from '../../ui/text/text';
import Button from 'elementor-app/ui/molecules/button';

export default function ImportFailed() {
	return (
		<Layout type="import">
			<Message className="e-app-import-failed">
				<Heading size="lg">
					{ __( 'File Upload Failed', 'elementor' ) }
				</Heading>
				<Text size="md">
					{ __( 'File is invalid and could not be processed', 'elementor' ) }
				</Text>
				<Text size="md">
					<Button text={ __( 'Click Here', 'elementor' ) } url="/#" />
					<span> { __( 'to try solving the issue.', 'elementor' ) }</span>
				</Text>
				<Button variant="primary" text={ __( 'Select File', 'elementor' ) } url="/#" />
			</Message>
		</Layout>
	);
}

