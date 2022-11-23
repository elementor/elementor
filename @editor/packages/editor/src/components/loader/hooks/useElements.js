import {useEffect, useState} from "react";

const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export const useElements = () => {
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
