import Loading from "./loading";
import ResponsiveBar from "./responsive-bar";
import Notice from "./notice";

const Preview = () => {
	return (
		<div id="elementor-preview">
			<Loading />
			<ResponsiveBar />

			<div id="elementor-preview-responsive-wrapper"
				 className="elementor-device-desktop elementor-device-rotate-portrait">
				<div id="elementor-preview-loading">
					<i className="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</div>
				<Notice />
			</div>
		</div>
	)
}

export default Preview
