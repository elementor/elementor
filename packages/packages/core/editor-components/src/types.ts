import { V1Document } from "@elementor/editor-documents";

export type ComponentFormValues = {
	componentName: string;
};

export type Component = {
	id: number;
	name: string;
};

export type ExtendedWindow = Window & {
	elementor: {
		documents: {
			currentDocument: V1Document;
		};
	};
}