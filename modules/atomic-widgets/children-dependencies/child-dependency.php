<?php

namespace Elementor\Modules\AtomicWidgets\ChildrenDependencies;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\Utils\Element_Position;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Child_Dependency {

	private string $child_type;
	private ?Dependency_Manager $when = null;
	private ?Element_Position $position = null;
	private bool $stash = true;
	private ?array $default_model = null;

	private function __construct( string $child_type ) {
		$this->child_type = $child_type;
	}

	public static function for( string $child_type ): self {
		return new self( $child_type );
	}

	public function when( Dependency_Manager $when ): self {
		$this->when = $when;

		return $this;
	}

	public function position( Element_Position $position ): self {
		$this->position = $position;

		return $this;
	}

	public function stash( bool $stash = true ): self {
		$this->stash = $stash;

		return $this;
	}

	public function default_model( array $default_model ): self {
		$this->default_model = $default_model;

		return $this;
	}

	public function build(): array {
		if ( null === $this->when ) {
			throw new \InvalidArgumentException( 'Child_Dependency: `when` clause is required.' );
		}

		$when_config = $this->when->get();

		if ( null === $when_config ) {
			throw new \InvalidArgumentException( 'Child_Dependency: `when` clause must contain at least one term.' );
		}

		return [
			'child_type' => $this->child_type,
			'when' => $when_config,
			'position' => ( $this->position ?? Element_Position::last() )->to_array(),
			'stash' => $this->stash,
			'default_model' => $this->default_model,
		];
	}
}
