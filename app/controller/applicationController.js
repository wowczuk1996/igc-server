const GPS = require('../model/gps')
const request = require('request');
const IGCParser = require('igc-parser');

let startTime = 0;
let endTime = 0;
let lengthRoute = 0;
let routeTime = 0;
let speed = 0;
let endHeight = 0;
let startHeight = 0;
let result = '';
let coordinates = [];

exports.resources = (req, res) => {

        request.get(req.body.url, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                try {
                result = IGCParser.parse(body)
                setResult(result);
                    res.json({
                        'pilot': result.pilot,
                        'date': result.date,
                        'lengthRoute': lengthRoute.toFixed(2),
                        'startHeight': startHeight,
                        'endHeight': endHeight,
                        'startTime': startTime,
                        'startEnd': endTime,
                        'speed': speed.toFixed(2),
                        "routeTime": routeTime,
                        "task": result.task === null ? "nie" : "tak",
                        "statusCode":200,
                        "coordinates": coordinates

                    });
                }catch (e) {
                    res.json({
                        'messageError': "Cen not read file",
                        'statusCode' : 422
                    });
                }
            }else{
                res.json({
                    'messageError': "Bad url",
                    'statusCode' : 400
                });
            }
        })
    };

setResult = (result) => {
    let eT = 0;
    let sT = 0;
    coordinates = [];
    lengthRoute = 0;
    result.fixes.map((x, index) => {

        if ((index === 0)) {
            sT = x.timestamp;
            startTime = x.time;
            startHeight = x.gpsAltitude;
        } else if ((index === (result.fixes.length - 1))) {
            eT = x.timestamp;
            endTime = x.time;
            endHeight = x.gpsAltitude;
        }
        coordinates.push(new GPS(x.latitude, x.longitude));

        //Route
        if (index + 1 < result.fixes.length) {
            getLengthRoute(x.latitude, x.longitude, result.fixes[index + 1].latitude, result.fixes[index + 1].longitude);
        }
    });

    //Time
    routeTime = msToTime(new Date((eT - sT)));

    //Speed
    getSpeed(routeTime, lengthRoute);
};

msToTime = (s) => {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;

    return hrs + ':' + mins + ':' + secs;
}

degreesToRadians = (degrees) => {
    return degrees * Math.PI / 180;
}

getLengthRoute = (lat1, lon1, lat2, lon2) => {
    let earthRadiusKm = 6371;

    let dLat = degreesToRadians(lat2 - lat1);
    let dLon = degreesToRadians(lon2 - lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    lengthRoute += earthRadiusKm * c;
    return earthRadiusKm * c;
};

getSpeed = (time, route) => {
    speed = 0;
    time = (time.split(":")[0] * 3600 + +time.split(":")[1] * 60 + +time.split(":")[2]);
    speed = ((route * 1000) / time) * 3.6;
}







