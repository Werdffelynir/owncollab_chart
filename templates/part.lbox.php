
    <div>
        <div class="lbox_title"><?=$l->t('Edit task details')?></div>
        <input name="lbox_text" type="text">
    </div>

    <div>
        <div class="lbox_title"><?=$l->t('Assign to resources')?></div>
        <input name="lbox_users" type="text">
<!--        <div class="resources_tags">
            <div class="rtag">
                <div class="tbl">
                    <div class="rtag_name tbl_cell">user1</div>
                    <div class="rtag_delete icon-close tbl_cell"></div>
                </div>
            </div>
        </div>-->
    </div>

    <div class="tbl">
        <div class="tbl_cell lbox_date_column">
            <div class="tbl">
                <div class="tbl_cell lbox_title"><?=$l->t('Start')?></div>
                <div class="tbl_cell"><input name="lbox_start_date" type="text"></div>
            </div>
            <div class="tbl">
                <div class="tbl_cell lbox_title"><?=$l->t('End')?></div>
                <div class="tbl_cell"><input name="lbox_end_date" type="text"></div>
            </div>
            <div class="tbl">
                <div class="tbl_cell lbox_title"><?=$l->t('Progress')?></div>
                <div class="tbl_cell"><input name="lbox_progress" type="text"></div>
            </div>
        </div>
        <div class="tbl_cell valign_middle txt_center">
            <input name="lbox_predecessor" type="submit" value="<?=$l->t('Predecessor')?>">
        </div>
        <div class="tbl_cell valign_middle txt_right">
            <div>
                <span class="lbox_title"><?=$l->t('Milestone')?></span>
                <span>
                    <input id="lbm" name="lbox_milestone" type="checkbox">
                    <label for="lbm"><span></span></label>
                </span>
            </div>
        </div>
    </div>
