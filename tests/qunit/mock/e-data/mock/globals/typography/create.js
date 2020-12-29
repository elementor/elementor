import MockDataBase from 'elementor/tests/qunit/mock/e-data/mock/base/mock-data-base';
import Data from './fcf2ddc.json';

export class GlobalsTypographyCreate extends MockDataBase {
	getType() {
		return 'create';
	}

	getCommand() {
		return 'globals/typography';
	}

	getMockData() {
		return Data;
	}
}
