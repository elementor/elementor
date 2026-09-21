import ReactUtils from 'elementor-utils/react';

const MOUNT_ID = 'e-agents-ready';

const init = () => {
	const rootElement = document.querySelector( `#${ MOUNT_ID }` );

	if ( ! rootElement ) {
		return;
	}

	ReactUtils.render( <></>, rootElement );
};

init();
