import Panel from "./panel";
import Navigator from "./navigator";
import Preview from "./preview";

const Wrapper = () => {
	return (
		<div id="elementor-editor-wrapper">
			<Panel />
			<Preview />
			<Navigator />
		</div>
	)
}

export default Wrapper
