/* global $e */
import {Logo} from "./Logo";

export const Header = (props) => {
	return (
		<header id="elementor-panel-header-wrapper">
			<div id="elementor-panel-header">
				<div id="elementor-panel-header-menu-button" className="elementor-header-button"
					 onClick={() => props.setUseOldPanel(true) && $e.route('panel/menu')}>
					<i className="elementor-icon eicon-menu-bar tooltip-target" aria-hidden="true"
					   data-tooltip="Menu"></i>
					<span className="elementor-screen-only">Menu</span>
				</div>
				<div id="elementor-panel-header-title" className="elementor-beta-badge">
					<Logo/>
				</div>
				<div id="elementor-panel-header-add-button" className="elementor-header-button"
					 onClick={() => $e.route('panel/elements/categories')}>
					<i className="elementor-icon eicon-apps tooltip-target" aria-hidden="true"
					   data-tooltip="Widgets Panel"></i>
					<span className="elementor-screen-only">Widgets Panel</span>
				</div>
			</div>
		</header>
	);
}
