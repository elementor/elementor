import {Panel} from "./panel-wrapper/Panel";
import Navigator from "./navigator";
import Preview from "./preview";

import './variables.css';
import {ElementsPanel} from "./elements-panel/ElementsPanel";
import {useEffect, useState} from "react";

const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

function useElements() {
	const [elements, setElements] = useState([]);

	useEffect(() => {
		if (!elements.length) {
			sleep(500).then(() => {
				setElements(Object.values(window.elementor.widgetsCache));
			});
		}
	}, [elements.length]);

	return elements;
}

function useCategories() {
	const [ categories, setCategories ] = useState( [] );

	useEffect(() => {
		if (!categories.length) {
			sleep(500).then(() => {
				const documentCategories = window.elementor.documents.getCurrent().config.panel.elements_categories;
				console.log(documentCategories)
				setCategories(Object.entries(documentCategories).map(([id, category]) => {
					return {
						id,
						...category,
						isActive: category.active !== false,
					}
				}));
			});
		}
	}, [categories.length]);

	console.log( categories );
	return categories;
}

const Wrapper = () => {
	const categories = useCategories();
	const elements = useElements();

	return (
		<div id="elementor-editor-wrapper">
			<Panel>
				<ElementsPanel
					categories={categories}
					elements={elements}
				/>
			</Panel>
			<Preview/>
			<Navigator/>
		</div>
	)
}

export default Wrapper
