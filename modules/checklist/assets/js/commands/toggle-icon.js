import TogglePopup from './toggle-popup';

export class ToggleIcon extends $e.modules.CommandBase {
	static isSettingsOn = true;

	apply( shouldShow ) {
		document.body.querySelector( '[aria-label="Checklist"]' ).parentElement.style.display = shouldShow
			? 'block'
			: 'none';

		if ( ! shouldShow && TogglePopup.isOpen ) {
			$e.run( 'checklist/toggle-popup' );
		}
	}
}

export default ToggleIcon;
