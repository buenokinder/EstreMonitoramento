module.exports = {

    run: function () {

        //var options = {
        //    host: 'localhost',
        //    port: 1337,
        //    path: '/MarcoSuperficial/monitoramentos/?skipdatefilter=true',
        //    method: 'GET'
        //};


        Piezometro.monitoramentos

        var request = require('request');
        request('http://localhost:1337/MarcoSuperficial/monitoramentos/?skipdatefilter=true', function (error, response, body) {

            if (!error && response.statusCode == 200) {
                var i = 0;

                var jsonBody = JSON.parse(body);
                for (var item in jsonBody) {
                    if (i == 3) {
                        break;
                    }

                    console.log(item);
                    i += 1;


                }
            }
        });

    }
}

