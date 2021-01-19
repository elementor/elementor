import Layout from '../../../templates/layout';
import Message from '../../../ui/message/message';
import ClickHere from '../../../ui/click-here/click-here';
import UploadFile from 'elementor-app/molecules/upload-file';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import useFile from '../../../hooks/use-file/use-file';

import './import-failed.scss';

export default function ImportFailed() {
	const { setFile } = useFile();

	return (
		<Layout type="import">
			<Message className="e-app-import-failed">
				<div>
					<Icon className="e-app-import-failed__icon eicon-warning" />

					<Heading variant="display-3">
						{ __( 'File Upload Failed', 'elementor' ) }
					</Heading>

					<Text variant="xl">
						{ __( 'File is invalid and could not be processed', 'elementor' ) }
						<br />
						<ClickHere url="/#" /> { __( 'to try solving the issue.', 'elementor' ) }
					</Text>

					<UploadFile onFileSelect={ ( files ) => {
						setFile( files[ 0 ] );
					} } />
				</div>
			</Message>
		</Layout>
	);
}

