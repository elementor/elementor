import { type addTool } from '../../init';
import addListGlobalClassesTool from './list-global-classes';
import addRemoveGlobalClassTool from './remove-global-class';

export default ( _addTool: typeof addTool ) => {
	addListGlobalClassesTool( _addTool );
	addRemoveGlobalClassTool( _addTool );
};
