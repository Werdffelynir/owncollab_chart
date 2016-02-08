<div id="chart_settings" class="">

    <h3><?php p($l->t('Date'));?></h3>
    <div class="oneline">
        <input name="show_today_line" type="checkbox" class="checkbox">
        <?php p($l->t('Show today as red vertical line'));?>
    </div>

    <h3><?php p($l->t('Taskname'));?></h3>
    <div class="oneline">
        <input name="show_task_name" type="checkbox"> <?php p($l->t('Show task name in task bar'));?>
    </div>

    <h3><?php p($l->t('User colors'));?></h3>
    <div class="oneline">
        <input name="show_user_color" type="checkbox"> <?php p($l->t('Colorize progress bar with color of first user'));?>
    </div>
    <div class="oneline">
        <em class="cg_info"><?php p($l->t('color has to be defined by the admin in the user management'));?></em>
    </div>

    <h3><?php p($l->t('Scales'));?></h3>
    <div class="oneline">
        <input name="scale" value="hour" type="radio"> <?php p($l->t('Scale to hour'));?>
    </div>
    <div class="oneline">
        <input name="scale" value="day" type="radio"> <?php p($l->t('Scale to day'));?>
    </div>
    <div class="oneline">
        <input name="scale" value="week" type="radio"> <?php p($l->t('Scale to week'));?>
    </div>
    <div class="oneline">
        <input name="scale_fit" value="fit" type="checkbox"> <?php p($l->t('Zoom to fit'));?>
    </div>

    <h3><?php p($l->t('Show critical path'));?></h3>
    <div class="oneline">
        <input name="critical_path" type="checkbox"> <?php p($l->t('Critical path'));?>
    </div>
    <div class="oneline">
        <em class="cg_info"><?php p($l->t('only available in commercial version'));?></em>
    </div>

</div>
