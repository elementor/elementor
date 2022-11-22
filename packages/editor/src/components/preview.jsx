import ResponsiveBar from "./responsive-bar";
import Notice from "./notice";

const Preview = () => {
	return (
		<div id="elementor-preview" style={{
			"width": "100%",
			"height": "100%",
		}}>
			<ResponsiveBar />

			<div id="elementor-preview-responsive-wrapper"
				 className="elementor-device-desktop elementor-device-rotate-portrait"
				 style={{
					 "width": "100%",
					 "height": "100%",
				 }}
			>
				<Notice />
			</div>
		</div>
	)
}

export default Preview
