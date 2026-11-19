<?php

namespace Elementor\Modules\CompositeWidgets\Definitions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handed to the site provider (Elementor Pro) on `elementor/composite-widgets/register-site`.
 * Definitions registered here are marked `source: site` and must use the `site/` id namespace.
 */
class Site_Definitions_Registrar {
	/** @var callable( array, bool ): bool */
	private $register;

	public function __construct( callable $register ) {
		$this->register = $register;
	}

	public function register( array $definition, bool $is_archived = false ): bool {
		return ( $this->register )( $definition, $is_archived );
	}
}
