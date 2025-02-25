<?php
namespace Elementor\Modules\EditorUser;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const PACKAGES = [
		'query',
		'editor-user',
	];

	public function get_name() {
		return 'editor-user';
	}

	public function __construct() {
		parent::__construct();

		$is_atomic_widgets_active = Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );

		if ( $is_atomic_widgets_active ) {
			$this->register_hooks();
		}
	}

	public function register_hooks() {
		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
		( new Editor_User_Rest_Api() )->register_hooks();
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}
}
