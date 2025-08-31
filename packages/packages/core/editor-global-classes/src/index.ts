import { deleteClass, onDelete } from './components/class-manager/delete-class';

export { GLOBAL_CLASSES_PROVIDER_KEY } from './global-classes-styles-provider';
export { selectOrderedClasses } from './store';

export const StoreActions = {
	onDelete,
	deleteClass,
};

export { init } from './init';
