import HookDataBase from 'elementor-api/modules/hooks/data/base';

export class Agreement extends HookDataBase {
	register() {
		$e.hooks.registerDataAgreement( this );
	}
}
