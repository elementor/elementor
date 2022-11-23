import './App.css';
import './assets/eicons/css/elementor-icons.css';
import {PanelEmpty} from "./stories/PanelEmpty";
import {HistoryPanelEmpty} from "./stories/HistoryPanelEmpty";
import {HistoryPanelFull} from "./stories/HistoryPanelFull";
import {ElementsPanelFull} from "./stories/ElementsPanelFull";

function App() {

	return (
		<div className="App">
			<link rel="stylesheet" href="https://connect.elementor.cloud/wp-content/plugins/elementor/assets/css/editor.min.css?ver=3.8.0-cloud1" />
			{ /* <link rel="stylesheet" href="https://connect.elementor.cloud/wp-content/plugins/elementor/assets/css/editor-dark-mode.min.css?ver=3.8.0-cloud1" />*/ }

			<PanelEmpty />
			<HistoryPanelEmpty />
			<HistoryPanelFull />
			<ElementsPanelFull />
		</div>
	);
}

export default App;
