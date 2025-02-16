<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Isolation\Elementor_Adapter;
use Elementor\Core\Isolation\Elementor_Adapter_Interface;

class Elementor_Adapter_Mock extends Elementor_Adapter implements Elementor_Adapter_Interface {
	private string $tier;

	public function __construct( $tier = 'pro' ) {
		$this->tier = $tier;
	}

	public function get_tier(): string {
		return $this->tier;
	}
}
