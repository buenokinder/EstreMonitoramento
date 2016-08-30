module.exports.crontab = {

    crons: function () {
        var jobs = [];
        jobs.push({ interval: '*/1 * * * *', method: 'alertas' });
        return jobs;
    },
 
    alertas: function () {
        require('../crontab/alertas.js').run();

    }
};