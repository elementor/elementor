import CommandData from 'elementor-api/modules/command-data';

class Index extends CommandData {
	applyAfterGet( data, args = {} ) {
		if ( args.test ) {
			return { fake: 'data' };
		}

		return data;
	}
}

export { Index };
