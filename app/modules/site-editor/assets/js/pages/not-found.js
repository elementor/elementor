import Dialog from 'elementor-app/ui/dialog/dialog';

export default function NotFound() {
	const url = React.useMemo( () => ( elementorAppConfig.menu_url.split( '#' )?.[ 1 ] || '/site-editor' ), [] );

	return (
		<Dialog
			title={ __( 'Theme Builder could not be loaded', 'elementor' ) }
			text={ __( 'We’re sorry, but something went wrong. Click on ‘Learn more’ and follow each of the steps to quickly solve it.', 'elementor' ) }
			approveButtonUrl="https://go.elementor.com/app-theme-builder-load-issue/"
			approveButtonColor="link"
			approveButtonTarget="_blank"
			approveButtonText={ __( 'Learn More', 'elementor' ) }
			dismissButtonText={ __( 'Go Back', 'elementor' ) }
			dismissButtonUrl={ url }
		/>
	);
}
