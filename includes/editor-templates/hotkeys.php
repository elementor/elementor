<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
?>
<script type="text/template" id="tmpl-elementor-hotkeys">

	<div id="elementor-hotkeys__content">
		<div id="elementor-hotkeys__actions" class="elementor-hotkeys__col">

			<div class="elementor-hotkeys__header">
				<h3><?php echo __( 'Actions', 'elementor' ); ?></h3>
			</div>
			<div class="elementor-hotkeys__list">
				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Undo', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>Z</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Redo', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>Shift</span>
						<span>Z</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Copy', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>C</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Paste', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>V</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Paste Style', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>Shift</span>
						<span>C</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Delete', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Delete</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Duplicate', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>D</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Save', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>S</span>
					</div>
				</div>

			</div>
		</div>

		<div id="elementor-hotkeys__navigation" class="elementor-hotkeys__col">

			<div class="elementor-hotkeys__header">
				<h3><?php echo __( 'Go To', 'elementor' ); ?></h3>
			</div>
			<div class="elementor-hotkeys__list">
				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Show / Hide Panel', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>P</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Responsive Mode', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>Shift</span>
						<span>M</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'History', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>Shift</span>
						<span>H</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Navigator', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>Shift</span>
						<span>I</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Template Library', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>Shift</span>
						<span>L</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo __( 'Keyboard Shortcuts', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Ctrl / Cmd</span>
						<span>?</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</script>
