import Layout from '../../../templates/layout';
import Message from '../../../ui/message/message';
import ClickHere from '../../../ui/click-here/click-here';
import Footer from '../../../shared/footer/footer';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Button from 'elementor-app/ui/molecules/button';

import './import-success.scss';

export default function ImportSuccess() {
	const getFooter = () => (
		<Footer separator justify="end">
			<Button
				variant="contained"
				size="lg"
				text={ __( 'View Live Site', 'elementor' ) }
				color="primary"
				url="#"
			/>
		</Footer>
	);

	return (
		<Layout type="import" footer={ getFooter() }>
			<section className="e-app-import-success">
				<Message>
					<img className="e-app-import-success__main-image" src={ elementorAppConfig.assets_url + 'images/go-pro.svg' } />

					<Heading variant="display-3">
						{ __( 'Congrats! Your Kit was Imported Successfully', 'elementor' ) }
					</Heading>

					<Text variant="xs" tag="span">
						<ClickHere url="/#" /> { __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }
					</Text>
				</Message>
			</section>
		</Layout>
	);
}
