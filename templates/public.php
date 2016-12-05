<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */

?>

<div id="app">
    <div id="app-content">
        <div id="app-content-wrapper">
            <div id="gantt-chartpublic" style=" width:100%; height:90%; "></div>
            <div id="ganttdatajson" style="display: none"><?php print_unescaped(json_encode($_['json']))?></div>
        </div>
    </div>
</div>