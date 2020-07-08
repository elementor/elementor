import Layout from '../../templates/layout';
import DragDrop from './drag-drop/drag-drop';
import Message from '../../ui/message/message';
import Box from '../../ui/box/box';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';

import './import.scss';

export default function Import() {
	const onDragOver = ( event ) => {
		console.log( 'event', event );
	};

	return (
		<Layout type="import">
			<section className="e-app-import">
				<DragDrop>
					<Message className="e-app-import__select-file">
						<Heading variant="lg">
							{ __( 'Import a Kit to Your Site', 'elementor' ) }
						</Heading>

						<Text variant="md">
							{ __( 'Drag & Drop your zip template file', 'elementor' ) }
						</Text>

						<Text variant="sm">
							{ __( 'Or', 'elementor' ) }
						</Text>

						<Button color="primary" size="sm" text={ __( 'Select File', 'elementor' ) } url="/#" />
					</Message>
				</DragDrop>

				<Box type="notice">
					{ __( 'Important: It is strongly recommended that you backup your database before Importing a Kit.', 'elementor' ) }
				</Box>
			</section>
		</Layout>
	);
}

