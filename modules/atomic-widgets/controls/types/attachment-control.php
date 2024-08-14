<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Attachment_Control extends Atomic_Control_Base {
	private string $title;

	/**
	 * @var string $media_type The type of the media. Can be 'image';
	 */
	private string $media_type;

	public function get_type(): string {
		return 'attachment';
	}

	public function set_title( string $title ): self {
		$this->title = $title;

		return $this;
	}

	public function set_media_type( string $media_type ): self {
		$this->media_type = $media_type;

		return $this;
	}

	public function get_props(): array {
		return [
			'title' => $this->title,
			'media_type' => $this->media_type,
		];
	}
}
