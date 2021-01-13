import Layout from '../../../templates/layout';
import Message from '../../../ui/message/message';
import Footer from '../../../shared/footer/footer';
import Button from 'elementor-app/ui/molecules/button';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './export-plugins-message.scss';

export default function ExportPluginsMessage() {
	const getFooter = () => (
		<Footer separator justify="end">
			<Button variant="contained" color="primary" text={ __( 'Next', 'elementor' ) } url="/export-plugins" />
		</Footer>
	);

	return (
		<Layout type="export" footer={ getFooter() }>
			<Message className="e-app-detect-plugins">
				<Icon className="e-app-detect-plugins__icon eicon-cogs-check" />

				<Heading variant="display-3">
					{ __( 'Automatically Detect Used Plugins', 'elementor' ) }
				</Heading>

				<Text variant="xl">
					{ __( 'Elementor will attempt to automatically identify all plugins used to create your site content. You can', 'elementor' ) }	<Button variant="underlined" color="link" text={ __( 'customize your list of plugins', 'elementor' ) } url="/#" /> { __( 'by adding or removing them manually', 'elementor' ) }
				</Text>
			</Message>
		</Layout>
	);
}
