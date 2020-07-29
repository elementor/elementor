import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import Notice from '../../ui/notice/notice';
import SelectFile from '../../shared/select-file/select-file';
import DragDrop from 'elementor-app/ui/atoms/drag-drop';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import useFile from '../../hooks/use-file/use-file';

import './import.scss';
import ImportFile from "../../ui/import-file/import-file";

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
				<ImportFile
					heading={ __( 'Import a Kit to Your Site', 'elementor' ) }
					text={ __( 'Drag & Drop your zip template file', 'elementor' ) }
					secondaryText={ __( 'Or', 'elementor' ) }
					onFileSelect={ ( e ) => {
						console.log( 'File is ready to be sent: ', e.dataTransfer.files[ 0 ] );
					} }
				/>
				<Notice color="warning" className="kit-content-list__notice">
					<Text variant="xs">
						{ __( 'Important: It is strongly recommended that you backup your database before Importing a Kit.', 'elementor' ) }
					</Text>
				</Notice>
			</section>
		</Layout>
	);
}

