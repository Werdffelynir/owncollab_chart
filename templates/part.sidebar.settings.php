<div id="chart_settings" class="">

    <h3><?php p($l->t('Date'));?></h3>

    <div class="oneline">
        <input id="stl" name="show_today_line" type="checkbox">
        <label for="stl"> <span></span> <?php p($l->t('Show today as red vertical line'));?></label>
    </div>

    <h3><?php p($l->t('Taskname'));?></h3>
    <div class="oneline">
        <input id="stn" name="show_task_name" type="checkbox">
        <label for="stn"> <span></span> <?php p($l->t('Show task name in task bar'));?> </label>
    </div>

    <h3><?php p($l->t('User colors'));?></h3>
    <div class="oneline">
        <input id="suc" name="show_user_color" type="checkbox">
        <label for="suc"> <span></span> <?php p($l->t('Colorize progress bar with color of first user'));?> </label>
    </div>
    <div class="oneline">
        <em class="cg_info"><?php p($l->t('color has to be defined by the admin in the user management'));?></em>
    </div>

    <h3><?php p($l->t('Scales'));?></h3>
    <div class="oneline">
        <input id="st1" name="scale_type" value="hour" type="radio">
        <label for="st1"> <span></span> <?php p($l->t('Scale to hour'));?> </label>
    </div>
    <div class="oneline">
        <input id="st2" name="scale_type" value="day" type="radio">
        <label for="st2"> <span></span> <?php p($l->t('Scale to day'));?> </label>
    </div>
    <div class="oneline">
        <input id="st3" name="scale_type" value="week" type="radio">
        <label for="st3"> <span></span> <?php p($l->t('Scale to week'));?> </label>
    </div>
    <div class="oneline">
        <input id="sfm" name="scale_fit" value="fit" type="checkbox">
        <label for="sfm"> <span></span> <?php p($l->t('Zoom to fit'));?> </label>
    </div>

    <h3><?php p($l->t('Show critical path'));?></h3>
    <div class="oneline">
        <input id="cp" name="critical_path" type="checkbox">
        <label for="cp"> <span></span> <?php p($l->t('Critical path'));?> </label>
    </div>
    <div class="oneline">
        <em class="cg_info"><?php p($l->t('only available in commercial version'));?></em>
    </div>

</div>
