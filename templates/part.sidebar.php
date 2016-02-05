<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */

?>

<div id="sidebar-wrapper">
    <div id="sidebar-tab">
        <span id="sidebar_tab_1" class="sidebar_tab_active"><?php p($l->t('Share'));?></span>
        <span id="sidebar_tab_2"><?php p($l->t('Export'));?></span>
        <span id="sidebar_tab_3"><?php p($l->t('Settings'));?></span>
    </div>
    <div id="sidebar-content">
        <div id="sidebar_content_1" style="display: block">
            <?php print_unescaped($this->inc('part.sidebar.share')); ?>
        </div>
        <div id="sidebar_content_2">
            <?php print_unescaped($this->inc('part.sidebar.export')); ?>
        </div>
        <div id="sidebar_content_3">
            <?php print_unescaped($this->inc('part.sidebar.settings')); ?>
        </div>
    </div>
</div>

