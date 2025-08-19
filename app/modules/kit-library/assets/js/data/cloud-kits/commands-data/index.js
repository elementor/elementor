export { Eligibility } from './eligibility';

export class Index extends $e.modules.CommandData {
	static getEndpointFormat() {
		return 'cloud-kits/{id}';
	}
}
