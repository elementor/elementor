export const Footer = () => {
	return (
		<footer id="elementor-panel-footer">
			<div className="elementor-panel-container">
				<nav id="elementor-panel-footer-tools">
					<div id="elementor-panel-footer-settings"
						 className="elementor-panel-footer-tool elementor-leave-open tooltip-target"
						 data-tooltip="Settings" original-title="">
						<i className="eicon-cog" aria-hidden="true"></i>
						<span className="elementor-screen-only">Post Settings</span>
					</div>
					<div id="elementor-panel-footer-navigator"
						 className="elementor-panel-footer-tool tooltip-target" data-tooltip="Navigator"
						 original-title="">
						<i className="eicon-navigator" aria-hidden="true"></i>
						<span className="elementor-screen-only">Navigator</span>
					</div>
					<div id="elementor-panel-footer-history"
						 className="elementor-panel-footer-tool elementor-leave-open tooltip-target"
						 data-tooltip="History" original-title="">
						<i className="eicon-history" aria-hidden="true"></i>
						<span className="elementor-screen-only">History</span>
					</div>
					<div id="elementor-panel-footer-responsive"
						 className="elementor-panel-footer-tool elementor-toggle-state">
						<i className="eicon-device-responsive tooltip-target" aria-hidden="true"
						   data-tooltip="Responsive Mode" original-title=""></i>
						<span className="elementor-screen-only">
							Responsive Mode		</span>
					</div>
					<div id="elementor-panel-footer-saver-preview"
						 className="elementor-panel-footer-tool tooltip-target" data-tooltip="Preview Changes"
						 original-title="">
						<span id="elementor-panel-footer-saver-preview-label">
							<i className="eicon-preview-medium" aria-hidden="true"></i>
							<span className="elementor-screen-only">Preview Changes</span>
						</span>
					</div>
					<div id="elementor-panel-footer-saver-publish" className="elementor-panel-footer-tool">
						<button id="elementor-panel-saver-button-publish"
								className="elementor-button elementor-button-success">
							<span className="elementor-state-icon">
								<i className="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
							</span>
							<span id="elementor-panel-saver-button-publish-label">Update</span>
						</button>
					</div>
					<div id="elementor-panel-footer-saver-options"
						 className="elementor-panel-footer-tool elementor-toggle-state">
						<button id="elementor-panel-saver-button-save-options"
								className="elementor-button elementor-button-success tooltip-target"
								data-tooltip="Save Options" data-tooltip-offset="7" original-title="">
							<i className="eicon-caret-up" aria-hidden="true"></i>
							<span className="elementor-screen-only">Save Options</span>
						</button>
						<div className="elementor-panel-footer-sub-menu-wrapper">
							<p className="elementor-last-edited-wrapper">
								<span className="elementor-state-icon">
									<i className="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
								</span>
								<span className="elementor-last-edited">Draft saved on <time>Jun 2, 17:22</time> by matiuph3a</span>
							</p>
							<div className="elementor-panel-footer-sub-menu">
								<div id="elementor-panel-footer-sub-menu-item-save-draft"
									 className="elementor-panel-footer-sub-menu-item">
									<i className="elementor-icon eicon-save" aria-hidden="true"></i>
									<span className="elementor-title">Save Draft</span>
								</div>
								<div id="elementor-panel-footer-sub-menu-item-save-template"
									 className="elementor-panel-footer-sub-menu-item">
									<i className="elementor-icon eicon-folder" aria-hidden="true"></i>
									<span className="elementor-title">Save as Template</span>
								</div>
							</div>
						</div>
					</div>
				</nav>
			</div>
		</footer>
	);
}
