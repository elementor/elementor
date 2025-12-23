<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Contracts\Condition;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Conditions_Registry extends Collection {
	public function register( string $key, Condition $condition ): self {
		$this->items[ $key ] = $condition;

		return $this;
	}
}
