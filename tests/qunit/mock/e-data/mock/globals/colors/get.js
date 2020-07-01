import MockDataBase from 'elementor-tests-qunit/mock/e-data/mock/base/mock-data-base';
import Data from './4521fd0.json';

export class GlobalsColorsGet extends MockDataBase {
	getType() {
		return 'get';
	}

	getCommand() {
		return 'globals/colors';
	}

	getMockData() {
		return {
			'4521fd0': Data,
		};
	}
}
