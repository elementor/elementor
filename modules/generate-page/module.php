<?php

namespace Elementor\Modules\GeneratePage;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const PACKAGES = [
		'editor-generate-page',
		'editor-generate-page-custom-css',
	];

	public function get_name() {
		return 'generate-page';
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );

		( new Generate_Page_REST_API() )->register_hooks();
	}

	private function add_packages( array $packages ): array {
		return array_merge( $packages, self::PACKAGES );
	}
}
