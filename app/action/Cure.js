define(['bs', 'action/Base', 'Sound', 'UI'], function($, ActionBase, Sound, UI) {

    function ActionCure(user, game, poiData, marker) {
        ActionBase.call(this, user, game, poiData, marker);
        return this;
    }
    ActionCure.prototype = Object.create(ActionBase.prototype);
    ActionCure.prototype.constructor = ActionCure;

    ActionCure.prototype.getName = function() {
        return 'ActionCure';
    }

    ActionCure.prototype.getVisibleName = function() {
        return 'Visit the doctor';
    }

    ActionCure.prototype.render = function() {

        // Renderer promise.
        var rendererPromise = $.Deferred();

        // Get the header
        var headerPromise = this.printHeader();

        // Once we have the header we concat the body and resolve the renderer promise.
        headerPromise.done(function(html) {
            html = html + '<div class="info-box"><p>Hey amigo! Your health has been restored, enjoy your day and behave!</p></div>' +
                UI.renderOkButton('Continue', 'btn btn-warning');
            rendererPromise.resolve(html);

            Sound.play('heal');

            // Update the user state the price is the health points that were restored,
            // they still heal you even if you don't have money.
            var healed = this.user.attrs.tHealth - this.user.state.cHealth;
            this.user.updateState({
                cHealth: this.user.attrs.tHealth,
                cWealth: this.user.state.cWealth - healed
            });

            this.user.addExperience(5);

            this.doneCallback();

        }.bind(this));

        return rendererPromise;
    };

    ActionCure.prototype.rendered = function() {
        $('#ok').on('click', function(ev) {
            $('#text-action').modal('hide');
        });
    };

    return ActionCure;
});
