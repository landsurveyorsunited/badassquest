define(['bs', 'Const', 'MissionsChain', 'Mission', 'InfoWindow', 'Generator', 'PoiTypes'], function($, Const, MissionsChain, Mission, InfoWindow, Generator, PoiTypes) {

    function MissionsSetGenerator(map, game, user, employer, completedCallback) {
        this.map = map;
        this.game = game;
        this.user = user;

        this.employer = employer;
        this.completedCallback = completedCallback;

        return this;
    }

    MissionsSetGenerator.prototype = {
        map: null,
        game: null,
        user: null,

        employer: null,
        completedCallback : null,

        create: function(pois) {

            var missions = [];
            for (var i = 0; i < pois.length; i++) {
                var mission = this.createMission(pois[i], (i + 1));
                if (mission) {
                    missions.push(mission);
                }
            }

            // Set the chain of missions and start showing the first one.
            var missionsChain = new MissionsChain(this.map, this.game, this.user, missions, this.completedCallback);
            missionsChain.setMissionLocation();

        },

        createMission: function(poiData, nMission) {

            // Selecting a random action, actions depend on the poi type.
            var actions = PoiTypes.getMissionActions(poiData.types);
            var actionType = Generator.getRandomElement(actions);

            // For each mission we are going to create we need a different:
            // - A message from the employer about the action to perform
            // - An action to run once the location is clicked
            // - A message from the employer with a congrats + reward
            // - A reward (integer).
            var missionData = Generator.getRandomMission(this.user, actionType);
            if (!missionData) {
                // Stop if no remaining missions.
                return;
            }

            // * nMission as reward should be incremental.
            var reward = Generator.getRandomReward(this.user) * nMission;

            // Add the reward to the info message.
            missionData.infoMessage += ' There is a $' + reward + ' reward. Click to see where should you go.';

            return new Mission({
                name: missionData.title,
                position: {lat: poiData.geometry.location.lat(), lng: poiData.geometry.location.lng()},
                icon: {
                    url: this.employer.image,
                    scaledSize: new google.maps.Size(40, 40)
                },
                cleanMission: true,
                process: function(doneCallback) {
                    var action = new actionType(this.user, this.game, poiData);
                    action.start(doneCallback);
                }.bind(this),
                infoMessage: {
                    message: missionData.infoMessage,
                    from: '<img src="' + this.employer.image + '" class="img-circle notification-img"> ' + this.employer.name
                },
                doneMessage: {
                    message: missionData.doneMessage,
                    from: '<img src="' + this.employer.image + '" class="img-circle notification-img"> ' + this.employer.name
                },
                reward: reward
            });

        },
    };

    return MissionsSetGenerator;
});
