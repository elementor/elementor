import MockDataBase from 'elementor-tests-qunit/mock/e-data/mock/base/mock-data-base';
import Data from './fcf2ddc.json';

export class GlobalsTypographyGet extends MockDataBase {
	getType() {
		return 'get';
	}

	getCommand() {
		return 'globals/typography';
	}

	getMockData() {
		return {
			fcf2ddc: Data,
		};
	}
}
