import { css } from 'styled-components';

export default class Utils {
	static bindProp = ( obj ) => {
		const [ key, value ] = Object.entries( obj )[ 0 ];

		return value && css`
			${ key }: ${ value };
		`;
	};

	static bindProps = ( arr ) => arr.map( ( obj ) => this.bindProp( obj ) );
}
