import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';

export default function ImportFailed() {
	return (
		<Layout type="import">
			<Message className="e-app-import-failed">
				<div>
					<Heading variant="1">Heading</Heading>
				</div>
				<div>
					<Text>Text</Text>
				</div>

				<div style={ { display: 'none' } }>
					<Heading variant="lg">
						{ __( 'File Upload Failed', 'elementor' ) }
					</Heading>
					<Text variant="md">
						{ __( 'File is invalid and could not be processed', 'elementor' ) }
					</Text>
					<Text variant="md">
						<Button text={ __( 'Click Here', 'elementor' ) } url="/#" />
						<span> { __( 'to try solving the issue.', 'elementor' ) }</span>
					</Text>
					<Button color="primary" text={ __( 'Select File', 'elementor' ) } url="/#" />
				</div>
			</Message>
		</Layout>
	);
}

