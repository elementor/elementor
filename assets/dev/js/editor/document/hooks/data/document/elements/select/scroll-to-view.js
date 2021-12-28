import After from 'elementor-api/modules/hooks/data/after';

export class ScrollToView extends After {
	getCommand() {
		return 'document/elements/select';
	}

	getId() {
		return 'scroll-to-view';
	}

	getConditions( args ) {
		return args.options.scrollToView;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		$e.internal( 'document/elements/scroll-to-view', { container: containers[ 0 ] } );
	}
}

export default ScrollToView;
