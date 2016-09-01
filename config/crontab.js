module.exports.crontab = {

    crons: function () {
        var jobs = [];
        jobs.push({ interval: '*/1 * * * *', method: 'alertasMarcoSuperficial' });
        return jobs;
    },

    alertasMarcoSuperficial: function () {
        require('../crontab/alertasMarcoSuperficial.js').run();

    }
};