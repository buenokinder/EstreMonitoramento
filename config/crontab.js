module.exports.crontab = {

    crons: function () {
      //  var jobs = [];
      //  jobs.push({ interval: '*/1 * * * *', method: 'alertasMarcoSuperficial' });
      //  jobs.push({ interval: '*/1 * * * *', method: 'alertasPiezometro' });
      //  jobs.push({ interval: '0 0 4 1 1/1 ? *', method: 'alertasPluviometria' }); //Todo dia 1 de cada mês às 04h:00.

       // return jobs;
    },

    alertasMarcoSuperficial: function () {
     //   require('../crontab/alertasMarcoSuperficial.js').run();

    },

    alertasPiezometro: function () {
      //  require('../crontab/alertasPiezometro.js').run();

    },

    alertasPluviometria: function () {
      //  require('../crontab/alertasPluviometria.js').run();

    }
};