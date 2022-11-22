import ResponsiveBar from "./responsive-bar";
import Notice from "./notice";
import Loading from "./loading";

const Preview = ( props ) => {
	return (
		<div id="elementor-preview" style={{
			"width": "100%",
			"height": "100%",
		}}>
			<Loading />
			<ResponsiveBar />

			<div id="elementor-preview-responsive-wrapper"
				 className="elementor-device-desktop elementor-device-rotate-portrait"
				 style={{
					 "width": "100%",
					 "height": "100%",
				 }}
			>
				<iframe
					id="elementor-preview-iframe"
					src={props.iframePreviewURL}
					allowFullScreen="1"
					onLoad={props.onPreviewLoaded}
				></iframe>
				<Notice />
			</div>
		</div>
	)
}

export default Preview
