import Panel from "./panel";
import Navigator from "./navigator";
import Preview from "./preview";

import './variables.css';

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
