import { initCreateVariableTool } from './create-variable-tool';
import { initDeleteVariableTool } from './delete-variable-tool';
import { initUpdateVariableTool } from './update-variable-tool';
import { initVariablesResource } from './variables-resource';

export function initMcp() {
	initCreateVariableTool();
	initUpdateVariableTool();
	initDeleteVariableTool();
	initVariablesResource();
}
