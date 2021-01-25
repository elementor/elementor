import Layout from '../../../templates/layout';
import Message from '../../../ui/message/message';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './import-process-style.scss';

export default function ImportProcess() {
	return (
		<Layout type="import">
			<Message className="e-app-import-process">
				<Icon className="e-app-import-process__icon eicon-loading eicon-animation-spin" />

				<Heading variant="display-3" className="e-app-import-process__title">
					{ __( 'Your Kit Is Being Imported', 'elementor' ) }
				</Heading>

				<Text variant="xl" className="e-app-import-process__text">
					{ __( 'This may take a few moments to complete.', 'elementor' ) }
					<br />
					{ __( 'Please don’t close this window until importing is completed', 'elementor' ) }
				</Text>
			</Message>
		</Layout>
	);
}
