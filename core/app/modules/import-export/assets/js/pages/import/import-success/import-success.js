import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import ClickHere from '../../../ui/click-here/click-here';
import Footer from '../../../ui/footer/footer';
import DashboardButton from '../../../shared/dashboard-button/dashboard-button';

export default function ImportSuccess() {
	const getFooter = () => (
		<Footer separator justify="end">
			<DashboardButton />
		</Footer>
	);

	return (
		<Layout type="import" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				title={ __( 'Congrats! Your Kit Was Imported Successfully', 'elementor' ) }
				bottomText={ (
					<>
						<ClickHere url="/#" /> { __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }
					</>
				) }
			/>
		</Layout>
	);
}
