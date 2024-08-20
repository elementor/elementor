<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Attachment_Control extends Atomic_Control_Base {
	private array $media_types;

	public function get_type(): string {
		return 'attachment';
	}

	public function set_media_types( array $media_types ): self {
		$this->media_types = $media_types;

		return $this;
	}

	public function get_props(): array {
		return [
			'mediaTypes' => $this->media_types,
		];
	}
}
