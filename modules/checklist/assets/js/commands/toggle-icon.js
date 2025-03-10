import TogglePopup from './toggle-popup';
import { toggleChecklistPopup } from '../utils/functions';

export class ToggleIcon extends $e.modules.CommandBase {
	static isSettingsOn = true;

	apply( shouldShow ) {
		document.body.querySelector( '[aria-label="Checklist"]' ).parentElement.style.display = shouldShow
			? 'block'
			: 'none';

		if ( ! shouldShow && TogglePopup.isOpen ) {
			toggleChecklistPopup();
		}
	}
}

export default ToggleIcon;
