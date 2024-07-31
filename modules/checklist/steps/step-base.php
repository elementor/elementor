<?php
namespace Elementor\Modules\Checklist\Steps;

abstract class Step_Base {
	abstract protected function step_title();

	abstract protected function step_description();

	abstract protected function step_image_path();

	abstract protected function stepCTA();
}
