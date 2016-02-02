<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */

?>

<?php print_unescaped($this->inc('part.lbox')); ?>

<div id="app">
	<div id="app-content">
		<div id="app-content-wrapper">
			<?php print_unescaped($this->inc('part.topbar')); ?>
			<?php print_unescaped($this->inc('part.content')); ?>
		</div>
	</div>
    <div id="app-sidebar" class="disappear">
		<?php print_unescaped($this->inc('part.sidebar')); ?>
	</div>
</div>
