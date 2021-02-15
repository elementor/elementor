import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
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
				heading={ __( 'Your file is ready!', 'elementor' ) }
				description={ __( 'You can find the components of this file in the Library.', 'elementor' ) }
				notice={ (
					<>
						<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
							{ __( 'Click Here', 'elementor' ) }
						</InlineLink> { __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }
					</>
				) }
			/>
		</Layout>
	);
}
