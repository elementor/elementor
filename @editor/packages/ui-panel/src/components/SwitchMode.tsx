import React from "react";

export const SwitchMode: React.VFC = () => {
	return (
		<div id="elementor-mode-switcher">
			<div id="elementor-mode-switcher-inner">
				<input id="elementor-mode-switcher-preview-input" type="checkbox"/>
				<label htmlFor="elementor-mode-switcher-preview-input" id="elementor-mode-switcher-preview"
					   title="Preview">
					<i className="eicon" aria-hidden="true" title="Hide Panel"></i>
					<span className="elementor-screen-only">Preview</span>
				</label>
			</div>
		</div>
	);
}
