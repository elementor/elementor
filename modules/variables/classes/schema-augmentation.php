<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\Variables\Base\Style_Schema;

class Schema_Augmentation {
	private array $augmenters = [];

	public function add_augmenter( Style_Schema $augmenter ): self {
		$this->augmenters[] = $augmenter;

		return $this;
	}

	public function apply_augmentations( array $schema ): array {
		foreach ( $this->augmenters as $augmenter ) {
			$schema = $augmenter->augment( $schema );
		}

		return $schema;
	}
}
