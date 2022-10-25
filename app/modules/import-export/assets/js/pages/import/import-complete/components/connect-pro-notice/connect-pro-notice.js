import Notice from 'elementor-app/ui/molecules/notice';
import Button from 'elementor-app/ui/molecules/button';

import './connect-pro-notice.scss';

export default function ConnectProNotice() {
	const getButton = () => (
		<Button
			text={ __( 'Let’s do it', 'elementor' ) }
			variant="outlined"
			color="secondary"
			size="sm"
			target="_blank"
			url={ elementorAppConfig.admin_url + 'admin.php?page=elementor-license' }
		/>
	);

	return (
		<Notice className="e-app-import-connect-pro-notice" label={ __( 'Tip:', 'elementor' ) } color="info" button={ getButton() }>
			{ __( 'Make sure your Elementor Pro account is connected', 'elementor' ) }
		</Notice>
	);
}
