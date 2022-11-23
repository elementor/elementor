import {useEffect, useState} from "react";
import {useDocumentConfig} from "./useDocumentConfig";

export const useCategories = () => {
	const [categories, setCategories] = useState([]);
	const config = useDocumentConfig();

	useEffect(() => {
		if (!categories.length) {
			const documentCategories = config.panel.elements_categories;
			setCategories(Object.entries(documentCategories).map(([id, category]) => {
				return {
					id,
					...category,
					isActive: category.active !== false,
				}
			}));
		}
	}, [categories.length]);

	return categories;
}
