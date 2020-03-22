import CommandData from 'elementor-api/modules/command-data';

export class Colors extends CommandData {
	applyAfterGet( data, args = {} ) {
		if ( args.test ) {
			return { fake: 'data' };
		}

		return data;
	}
}

export default Colors;
