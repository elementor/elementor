<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Notice_Control extends Atomic_Control_Base {
	private string $notice_type = 'info';
	private string $heading = '';
	private string $content = '';
	private string $dismissible = '';
	private string $button_text = '';
	private string $button_url = '';

	public function get_type(): string {
		return 'notice';
	}

	public function set_notice_type( string $notice_type ): self {
		$this->notice_type = $notice_type;

		return $this;
	}

	public function set_heading( string $heading ): self {
		$this->heading = $heading;

		return $this;
	}

	public function set_content( string $content ): self {
		$this->content = $content;

		return $this;
	}

	public function set_dismissible( string $dismissible ): self {
		$this->dismissible = $dismissible;

		return $this;
	}

	public function set_button_text( string $button_text ): self {
		$this->button_text = $button_text;

		return $this;
	}

	public function set_button_url( string $button_url ): self {
		$this->button_url = $button_url;

		return $this;
	}

	public function get_props(): array {
		return [
			'noticeType' => $this->notice_type,
			'heading' => $this->heading,
			'content' => $this->content,
			'dismissible' => $this->dismissible,
			'buttonText' => $this->button_text,
			'buttonUrl' => $this->button_url,
		];
	}
}
