import {Panel} from "../panel-wrapper/Panel";
import {ElementsPanel} from "../elements-panel/ElementsPanel";
import Preview from "../Preview";
import {Navigator} from "../Navigator";
import {useCategories} from "./hooks/useCategories";
import {useElements} from "./hooks/useElements";
import {useDocumentConfig} from "./hooks/useDocumentConfig";

export const Loader = () => {
	const categories = useCategories();
	const elements = useElements();
	const config = useDocumentConfig();

	return (
		<div id="elementor-editor-wrapper">
			<Panel>
				<ElementsPanel
					categories={categories}
					elements={elements}
				/>
			</Panel>
			<Preview
				iframePreviewURL={config?.urls.preview}
				onPreviewLoaded={() => {
					window.elementor.onPreviewLoaded();
				}}/>
			<Navigator/>
		</div>
	)
}
