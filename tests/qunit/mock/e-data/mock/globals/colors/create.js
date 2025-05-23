import MockDataBase from 'elementor/tests/qunit/mock/e-data/mock/base/mock-data-base';
import Data from './4521fd0.json';

export class GlobalsColorsCreate extends MockDataBase {
	getType() {
		return 'create';
	}

	getCommand() {
		return 'globals/colors';
	}

	getMockData() {
		return Data;
	}
}
