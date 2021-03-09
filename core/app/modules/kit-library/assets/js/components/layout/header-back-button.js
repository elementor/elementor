import { Button } from '@elementor/app-ui';

import './header-back-button.scss';

export default function HeaderBackButton() {
	return (
		<Button
			className="e-kit-library__header-back"
			icon="eicon-chevron-left"
			text={ __( 'Back', 'elementor' ) }
			onClick={ () => window.history.back() }
		/>
	);
}
