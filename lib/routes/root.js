(function () {
    'use strict';

    var define = require('amdefine')(module);

    var deps = [
        '../generatename'
    ];

    define(deps, function (generateName) {
        function RouteIndex(app) {
            app.get('/bootstrap', function (req, res) {
                var data = {
                    name : generateName()
                };
                res.json(data);
            });
        }

        module.exports = RouteIndex;
    });
}());
