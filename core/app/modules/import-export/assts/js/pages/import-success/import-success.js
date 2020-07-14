import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import ImportSuccessList from './import-success-list/import-success-list';
import Footer from '../../shared/footer/footer';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Button from 'elementor-app/ui/molecules/button';

import './import-success.scss';

export default function ImportSuccess() {
	return (
		<Layout type="import">
			<section className="e-app-import-success">
				<Message>
					<Heading size="lg">
						{ __( 'Congrats, the following kit elements were imported', 'elementor' ) }
					</Heading>

					<img src={ elementorAppConfig.assets_url + 'images/go-pro.svg' } />

					<ImportSuccessList />

					<Grid container justify="center">
						<Button color="primary" text={ __( 'View live Site', 'elementor' ) } url="/#"/>
					</Grid>
				</Message>

				<Footer justify="center">
					<Button variant="contained" size="md" text={ __( 'Click here', 'elementor' ) } url="/#" />
					<Text tag="span" variant="sm">{ __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }</Text>
				</Footer>
			</section>
		</Layout>
	);
}
