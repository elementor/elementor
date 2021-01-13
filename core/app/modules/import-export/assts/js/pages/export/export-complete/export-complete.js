import Layout from '../../../templates/layout';
import Message from '../../../ui/message/message';
import Footer from '../../../shared/footer/footer';
import ClickHere from '../../../ui/click-here/click-here';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';

import './export-complete.scss';

export default function ExportComplete() {
	const getFooter = () => (
		<Footer justify="center" className="e-app-export-complete__learn-more">
			<Button variant="underlined" color="link" size="lg" text={ __( 'Learn More', 'elementor' ) } url="/#" />
		</Footer>
	);

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-complete">
				<Message>
					<img className="e-app-export-complete__main-image" src={ elementorAppConfig.assets_url + 'images/go-pro.svg' } />

					<Heading variant="display-3">
						{ __( 'Your Kit Was Exported Successfully!', 'elementor' ) }
					</Heading>

					<Text variant="xl">
						{ __( 'Use this exported Kit on another Elementor site by uploading it via Kit Manager > Import Kit', 'elementor' ) }
					</Text>

					<Text tag="span" variant="sm" className="e-app-export-complete__secondary-sentence">
						{ __( 'If the download doesn\'t start automatically, please', 'elementor' ) } <ClickHere url="/#" />
					</Text>
				</Message>
			</section>
		</Layout>
	);
}

