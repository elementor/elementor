import WpDashboardTracking from '../wp-dashboard-tracking';

export const DashboardUtils = {
	isElementorPage() {
		const urlParams = new URLSearchParams( window.location.search );
		const page = urlParams.get( 'page' );

		if ( page && ( page.startsWith( 'elementor' ) || page.includes( 'elementor' ) || 'popup_templates' === page ) ) {
			return true;
		}

		const postType = urlParams.get( 'post_type' );

		if ( WpDashboardTracking.elementorPostTypes.includes( postType ) ) {
			return true;
		}

		const body = document.body;
		const bodyClasses = body.className.split( ' ' );

		return bodyClasses.some( ( cls ) =>
			cls.includes( 'elementor' ) &&
			( cls.includes( 'page' ) || cls.includes( 'post-type' ) ),
		);
	},
};
