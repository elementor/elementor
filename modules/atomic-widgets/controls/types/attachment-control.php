<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Attachment_Control extends Atomic_Control_Base {
	/**
	 * @var string $media_type The type of the media. Can be 'image';
	 */
	private string $media_type;

	/**
	 * @var string $wp_media_title The title of the WordPress media library modal.
	 */
	private string $wp_media_title;

	public function get_type(): string {
		return 'attachment';
	}

	public function set_media_type( string $media_type ): self {
		$this->media_type = $media_type;

		return $this;
	}

	public function set_wp_media_title( string $wp_media_title ): self {
		$this->wp_media_title = $wp_media_title;

		return $this;
	}

	public function get_props(): array {
		return [
			'media_type' => $this->media_type,
			'wp_media_title' => $this->wp_media_title,
		];
	}
}
