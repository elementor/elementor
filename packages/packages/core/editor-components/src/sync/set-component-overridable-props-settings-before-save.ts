import { V1Element } from "@elementor/editor-elements";
import { COMPONENT_DOCUMENT_TYPE } from "../components/consts";

export const setComponentOverridablePropsSettingsBeforeSave = ({
	container,
}: {
	container: V1Element;
}) => {
    const currentDocument = container.document;
	if ( ! currentDocument || currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE ) {
		return;
	}

	container.settings.set('overridable_props', mockComponentOverridables);
}

const mockComponentOverridables = {
    props: {
        "prop1_UUID": {
            overrideKey: "prop1_UUID",
            label: "User Name",
            elementId: "90d25e3",
            propKey: "title",
			elType: "widget",
            widgetType: "e-heading", // This is for sanitiztion & validation
            defaultValue: {
                "$$type": "string",
                "value": "Jane Smith"
            },
            groupId: "group1_UUID" // OPEN: can we remove it?
        }
    },
    groups: {
        items: {
            "group1_UUID": {
                id: "group1_UUID",
                label: "User Info",
                props: ["prop1_UUID"]
            }
        },
        order: ["group1_UUID"]
    },
}