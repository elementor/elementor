import * as React from "react";
import { Box, List, ListItem, ListItemButton, ListItemText, styled, Typography } from "@elementor/ui";
import { useComponents } from "../hooks/use-components";
import { Component } from "../types";
import { createElement, CreateElementParams, getContainer, getSelectedElements, selectElement, V1ElementModelProps, V1ElementSettingsProps } from "@elementor/editor-elements";
import getCurrentDocumentContainer from "../../../../libs/editor-elements/src/sync/get-current-document-container";
import { getComponentModel } from "./create-component-form/utils/replace-element-with-component";
import { useState } from "react";

export function ComponentsTab() {
	const { data: components } = useComponents();

	return (
		<List sx={{ display: "flex", flexDirection: "column", gap: 0.5, px: 2 }} >
			{components?.map((component) => <ComponentItem key={component.id} component={component} />)}
		</List>
	);
}

const ComponentItem = ({ component }: { component: Component }) => {
	const handleClick = () => {
		dropNewElement(getComponentModel(component.id));
	};
	
	const handleDragStart = () => {
		window.elementor.channels.editor.reply( 'element:dragged', null );

		window.elementor.channels.panelElements
			.reply( 'element:selected', getPanelElementView(getComponentModel(component.id)) )
			.trigger( 'element:drag:start' );
	};

	const handleDragEnd = () => {
		window.elementor.channels.panelElements.trigger( 'element:drag:end' );
	};

	return (
		<ListItem disablePadding >
			<ListItemButton sx={{ border: '1px solid', borderColor: 'divider', py: 0.5, px: 1}} shape="rounded" onClick={handleClick} draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
				<ListItemText primary={<Typography variant="caption" sx={ { color: 'text.primary' } }>{component.name}</Typography>} />
			</ListItemButton>
		</ListItem>
	);
};

const dropNewElement = (model: CreateElementParams['model']) => {
	const currentDocumentContainer = getCurrentDocumentContainer();
	const selectedElements = getSelectedElements();
	const selectedEl = getContainer( selectedElements[0].id );

	if ( selectedElements.length !== 1 || !selectedEl ) {
		return currentDocumentContainer;
	}

	let container;
	let options = {};

	switch (selectedEl.model.get('elType')) {
		case 'widget': {
			if ( !selectedEl.parent ) {
				return currentDocumentContainer;
			}

			container = selectedEl.parent;

			const selectedElIndex = selectedEl.parent?.children?.findIndex( el => el.id === selectedEl.id ) ?? - 1;
			if ( selectedElIndex > -1 ) {
				options = {at: selectedElIndex + 1};
			};
			break;
		}
		case 'section': {
			container = selectedEl.children?.[0];
			break;
		}
		default: {
			container = selectedEl;
			break;
		}
	}

	if ( !container ) {
		throw new Error( `Can't find container to drop new element at. Element to drop: ${JSON.stringify(model)}, Selected element: ${selectedEl.id}` );
	}

	createElement({
		containerId: container.id,
		model,
		options,
	})
};

const getPanelElementView = (	{widgetType, elType, settings}:{widgetType: string;
	elType: string; settings?: V1ElementSettingsProps;}) => {
	// const PanelElementView = window.Marionette.ItemView.extend({});
	const Model = window.Backbone.Model.extend( {} );
	const elModel = new Model( {
		widgetType,
		elType,
		custom: {
			isPreset: settings ? true : false,
			preset_settings: settings
		}
	} );


	// const elView = new PanelElementView( elModel );
	console.log( {elModel} );
	return {model:elModel};
}
