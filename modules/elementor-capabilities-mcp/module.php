<?php

namespace Elementor\Modules\ElementorCapabilitiesMcp;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	private const PACKAGE_NAME = 'elementor-capabilities-mcp';

	public function get_name(): string {
		return self::PACKAGE_NAME;
	}

	public static function is_active(): bool {
		return is_admin();
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/editor/v2/packages', [ $this, 'add_editor_packages' ] );
	}

	public function add_editor_packages( array $packages ): array {
		$packages[] = self::PACKAGE_NAME;

		return $packages;
	}
}
