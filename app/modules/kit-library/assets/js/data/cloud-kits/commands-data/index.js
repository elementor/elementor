export { Eligibility } from './eligibility';
export { Quota } from './quota';

export class Index extends $e.modules.CommandData {
	static getEndpointFormat() {
		return 'cloud-kits/{id}';
	}
}
