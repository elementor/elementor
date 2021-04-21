export { KitsFavorites } from './kits-favorites';

export class Index extends $e.modules.CommandData {
	static getEndpointFormat() {
		return 'kits/{id}';
	}
}
