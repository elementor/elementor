<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Contracts\Operation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Operations_Registry extends Collection {
	public function register( string $key, Operation $operation ): self {
		$this->items[ $key ] = $operation;

		return $this;
	}
}
