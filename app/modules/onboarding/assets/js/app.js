import { useEffect } from 'react';
import { LocationProvider, Router } from '@reach/router';
import router from '@elementor/router';

import { ContextProvider } from './context/context';
import Account from './pages/account';
import HelloTheme from './pages/hello-theme';
import SiteName from './pages/site-name';
import SiteLogo from './pages/site-logo';
import GoodToGo from './pages/good-to-go';
import InstallPro from './pages/upload-and-install-pro';

export default function App() {
	// Send an AJAX request to update the database option which makes sure the Onboarding process only runs once,
	// for new Elementor sites.
	useEffect( () => {
		// This is to prevent dark theme in onboarding app from the frontend and not backend
		const darkThemeClassName = 'eps-theme-dark';
		const hasDarkMode = document.body.classList.contains( darkThemeClassName );

		if ( hasDarkMode ) {
			document.body.classList.remove( darkThemeClassName );
		}

		if ( ! elementorAppConfig.onboarding.onboardingAlreadyRan ) {
			const formData = new FormData();

			formData.append( '_nonce', elementorCommon.config.ajax.nonce );
			formData.append( 'action', 'elementor_update_onboarding_option' );

			fetch( elementorCommon.config.ajax.url, {
				method: 'POST',
				body: formData,
			} );
		}

		elementorAppConfig.return_url = elementorAppConfig.admin_url;

		return () => {
			if ( hasDarkMode ) {
				document.body.classList.add( darkThemeClassName );
			}
		};
	}, [] );

	return (
		<ContextProvider>
			<LocationProvider history={ router.appHistory }>
				<Router>
					<Account default />
					<HelloTheme path="hello" />
					<SiteName path="siteName" />
					<SiteLogo path="siteLogo" />
					<GoodToGo path="goodToGo" />
					<InstallPro path="uploadAndInstallPro" />
				</Router>
			</LocationProvider>
		</ContextProvider>
	);
}
