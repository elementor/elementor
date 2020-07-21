import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Box from '../../ui/box/box';
import DragDrop from '../../ui/drag-drop/drag-drop';
import SelectFile from '../../shared/select-file/select-file';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import useFile from '../../hooks/use-file/use-file';

import './import.scss';

export default function Import() {
	const { setFile } = useFile(),
		dragDropEvents = {
			onDrop: ( event ) => {
				setFile( event.dataTransfer.files[ 0 ] );
			},
		};

	return (
		<Layout type="import">
			<section className="e-app-import">
				<DragDrop { ...dragDropEvents }>
					<Message>
						<Icon className="e-app-import__icon eicon-library-upload" />

						<Heading variant="display-3">
							{ __( 'Import a Kit to Your Site', 'elementor' ) }
						</Heading>

						<Text variant="xl">
							{ __( 'Drag & Drop your zip template file', 'elementor' ) }
						</Text>

						<Text variant="lg">
							{ __( 'Or', 'elementor' ) }
						</Text>

						<SelectFile />
					</Message>
				</DragDrop>

				<Box variant="notice" className="kit-content-list__notice">
					<Text variant="xs">
						{ __( 'Important: It is strongly recommended that you backup your database before Importing a Kit.', 'elementor' ) }
					</Text>
				</Box>
			</section>
		</Layout>
	);
}

