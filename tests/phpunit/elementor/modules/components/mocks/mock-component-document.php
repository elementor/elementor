<?php

namespace Elementor\Testing\Modules\Components\Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Mock_Component_Document {
	private ?array $overridable_props = null;
	public function __construct( ?array $overridable_props = null ) {
		$this->overridable_props = $overridable_props;
	}

    public function get_overridable_props(): ?array {
        return $this->overridable_props;
    }
}
