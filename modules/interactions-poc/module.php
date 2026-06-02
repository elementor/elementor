<?php

namespace Elementor\Modules\InteractionsPoc;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	public function get_name() {
		return 'interactions-poc';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_editor_scripts' ] );
	}

	public function enqueue_editor_scripts() {
		wp_enqueue_script(
			'elementor-interactions-poc-editor',
			plugins_url( 'assets/js/editor.js', __FILE__ ),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);
	}
}
