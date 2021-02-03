import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import ClickHere from '../../../ui/click-here/click-here';
import DashboardButton from 'elementor-app/molecules/dashboard-button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ImportSuccess() {
	const getFooter = () => (
		<WizardFooter separator justify="end">
			<DashboardButton />
		</WizardFooter>
	);

	return (
		<Layout type="import" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				title={ __( 'Congrats! Your Kit Was Imported Successfully', 'elementor' ) }
				bottomText={ (
					<>
						<ClickHere target="_blank" url="https://elementor.com/help/what-are-kits?utm_source=editor-app&utm_medium=wp-dash&utm_campaign=learn" /> { __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }
					</>
				) }
			/>
		</Layout>
	);
}
