var express = require('express');
var data = require("../../data");
var ana = data.analytics;
var uuid = require('node-uuid');
var api = data.api;
var router = express.Router();
router.get('/', function (req, res) {
    ana.getCountByDecade().then((allRes) => {
        ana.getTopFifteen().then((allRes2) => {
            ana.getCountByGenre().then((allRes3) => {
                ana.getTopRev().then((allRes4) => {
                    res.render("analytics/highcharts", {
                        resByDecade: allRes,
                        resTopFifteen : allRes2,
                        resByGenre : allRes3,
                        resTopRev : allRes4
                    });
                })
            })
        })
    })
}), module.exports = router;