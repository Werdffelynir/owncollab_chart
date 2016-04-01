<div id="chart_share">

    <div class="oneline">
        <input id="sis" name="is_share" type="checkbox">
        <label for="sis"><span></span> <?php p($l->t('Share chart project'));?> </label>
    </div>

    <div class="chart_share_on">

        <div class="oneline">
            <input name="share_link" autocomplete="off" readonly="readonly" placeholder="<?php p($l->t('Choose a password for the public link'));?>" type="text">
        </div>

        <div class="oneline">
            <input id="sip" name="share_is_protected" type="checkbox">
            <label for="sip"><span></span> <?php p($l->t('Password protection'));?> </label>
        </div>

        <div class="chart_share_password">
            <div class="oneline">
                <input name="share_password" type="password" autocomplete="off" placeholder="<?php p($l->t('Choose a password for the public link'));?>">
            </div>
        </div>

        <div class="oneline">
            <input id="sie" name="share_is_expire" type="checkbox">
            <label for="sie"><span></span> <?php p($l->t('Expiration time'));?> </label>
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
            <input name="share_email_submit" value="<?=$l->t('Submit')?>" type="button">
        </div>

    </div>

</div>