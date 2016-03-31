
    <div>
        <div class="lbox_title"><?=$l->t('Edit task details')?></div>
        <input name="lbox_text" type="text">
    </div>

    <div>
        <div class="lbox_title"><?=$l->t('Assign to resources')?></div>
        <input name="lbox_users" type="text">
    </div>

    <div class="tbl">
        <div class="tbl_cell lbox_date_column">
            <div class="tbl">
                <div class="tbl_cell"><?=$l->t('Start')?></div>
                <div class="tbl_cell"><input name="lbox_start_date" type="text"></div>
            </div>
            <div class="tbl">
                <div class="tbl_cell"><?=$l->t('End')?></div>
                <div class="tbl_cell"><input name="lbox_end_date" type="text"></div>
            </div>
            <div class="tbl">
                <div class="tbl_cell"><?=$l->t('Progress')?></div>
                <div class="tbl_cell"><input name="lbox_progress" type="text"></div>
            </div>
        </div>
        <div class="tbl_cell valign_middle txt_center">
            <div class="tbl">
                <div class="tbl_cell"></div>
                <div class="tbl_cell"><input name="lbox_predecessor" type="submit" value="<?=$l->t('Predecessor')?>"></div>
            </div>
            <div class="tbl lbox_buffer_wrapp">
                <div class="tbl_cell"></div>
                <div class="tbl_cell"><?=$l->t('Buffer')?> <input name="lbox_buffer" type="text"></div>
            </div>
        </div>
        <div class="tbl_cell valign_middle txt_right">
            <div>
                <span><?=$l->t('Milestone')?></span>
                <span>
                    <input id="lbm" name="lbox_milestone" type="checkbox">
                    <label for="lbm"><span></span></label>
                </span>
            </div>
        </div>
    </div>
