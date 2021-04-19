export { KitsDownloadLink } from './kits-download-link';

export class Index extends $e.modules.CommandData {
	static getEndpointFormat() {
		return 'kits/{id}';
	}
}
