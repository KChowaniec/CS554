var express = require('express');
var data = require("../../data");
var ana = data.analytics;
var uuid = require('node-uuid');
var api = data.api;
var router = express.Router();
router.get('/', function (req, res) {
    ana.getCountByDecade().then((allRes) => {
        res.render("analytics/highcharts", {
            results: allRes
            , partial: "jquery-detail-scripts"
        });
    })
}), module.exports = router;