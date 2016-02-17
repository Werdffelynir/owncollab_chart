<div id="chart_share">

    <div class="oneline">
        <input name="is_share" type="checkbox"> <?php p($l->t('Share chart project'));?>
    </div>

    <div class="chart_share_on">

        <div class="oneline">
            <input name="share_link" autocomplete="off" readonly="readonly" placeholder="<?php p($l->t('Choose a password for the public link'));?>" type="text">
        </div>

        <div class="oneline">
            <input name="share_is_protected" type="checkbox"> <?php p($l->t('Password protection'));?>
        </div>

        <div class="chart_share_password">
            <div class="oneline">
                <input name="share_password" type="password" autocomplete="off" placeholder="<?php p($l->t('Choose a password for the public link'));?>">
            </div>
        </div>

        <div class="oneline">
            <input name="share_is_expire" type="checkbox"> <?php p($l->t('Expiration time'));?>
        </div>

        <div class="chart_share_expiration">
            <div class="oneline">
                <input name="share_expire_time" class="datetimepic" value="" type="text" placeholder="<?php p($l->t('Expiration time'));?>" >
            </div>
        </div>

        <div class="oneline">
            <input
                id="owc_email_autocomplete"
                class="ui-autocomplete-input"
                name="_share_email_recipient"
                type="text"
                placeholder="<?php p($l->t('Provide recipient email address'));?>"
                autocomplete="off">
        </div>

        <div class="oneline" id="share_emails_list">

        </div>

        <div class="oneline">
            <input name="share_email_submit" value="Submit" type="button">
        </div>

    </div>

</div>