<?php
/**
 * @var OCP\Template $this
 * @var array $_
 */

$appName = 'owncollab_chart';

?>

<div id="app-content-inline-error"></div>

<div id="topbar">

    <div id="sortedfilters">

        <span id="ganttsort_id"><img src="<?php p($this->image_path($appName,'sort30.png'))?>" alt=""></span>

        <span id="ganttsort_task"><img src="<?php p($this->image_path($appName,'sort30.png'))?>" alt=""></span>
        <span id="ganttfilter_task"><img src="<?php p($this->image_path($appName,'filter30.png'))?>" alt=""></span>

        <span id="ganttsort_start"><img src="<?php p($this->image_path($appName,'sort30.png'))?>" alt=""></span>

        <span id="ganttsort_resource"><img src="<?php p($this->image_path($appName,'sort30.png'))?>" alt=""></span>
        <span id="ganttfilter_resource"><img src="<?php p($this->image_path($appName,'filter30.png'))?>" alt=""></span>

        <span id="act_undo" style="width: 30px;" ><img src="<?php p($this->image_path($appName,'undo.png'))?>" alt=""></span>
        <span id="act_redo" style="width: 30px;" ><img src="<?php p($this->image_path($appName,'redo.png'))?>" alt=""></span>

    </div>

    <div id="sidebar-toggle"></div>
    <div id="ganttsave"></div>
    <div id="ganttsaveloading" style="visibility:hidden"></div>

</div>
