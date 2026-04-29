<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Attachment_Type_Control extends Atomic_Control_Base {
	private array $options = [];
	private ?string $info_message = null;

	public function get_type(): string {
		return 'attachment-type';
	}

	public function set_options( array $options ): self {
		$this->options = $options;

		return $this;
	}

	public function set_info_message( string $message ): self {
		$this->info_message = $message;

		return $this;
	}

	public function get_props(): array {
		return [
			'options' => $this->options,
			'infoMessage' => $this->info_message,
		];
	}
}
