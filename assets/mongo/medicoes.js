function(_medicao) {

    var retorno = {
        deslocamentoHorizontalParcial: 0,
        deslocamentoHorizontalTotal: 0,
        velocidadeHorizontal: 0,
        velocidadeVertical: 0,
        criterioAlerta: Math.pow(2, 2)
    };

    var MedicaoAtual = db.medicaomarcosuperficial.findOne(_medicao);

    if (MedicaoAtual) {


        var MedicaoInicial = db.marcosuperficial.findOne({
            "_id": MedicaoAtual.marcoSuperficial
        });

        var MedicaoAnterior = db.medicaomarcosuperficial.find({
            data: {
                $lt: MedicaoAtual.data
            }
        }).sort({
            "data": -1
        });

        var alertas = db.alerta.find().sort({
            "valor": 1
        });
        if (MedicaoInicial && MedicaoAnterior) {

            var deltaParcialNorte = Math.pow((MedicaoAtual.norte - MedicaoAnterior[0].norte), 2);
            var deltaParcialEste = Math.pow((MedicaoAtual.este - MedicaoAnterior[0].este), 2);
            var deltaTotalNorte = Math.pow((MedicaoAtual.norte - MedicaoInicial.norte), 2);
            var deltaTotalEste = Math.pow((MedicaoAtual.este - MedicaoInicial.este), 2);

            DataAtual = Math.floor(MedicaoAtual.data.getTime() / (3600 * 24 * 1000));
            DataAnterior = Math.floor(MedicaoAnterior[0].data.getTime() / (3600 * 24 * 1000));
            DiferencaDatas = DataAtual - DataAnterior;

            //return Math.abs(MedicaoAtual.data- MedicaoAnterior[0].data);
            retorno.deslocamentoVerticalParcial = (MedicaoAtual.cota - MedicaoAnterior[0].cota) * 100;
            retorno.deslocamentoVerticalTotal = (MedicaoAtual.cota - MedicaoInicial.cota) * 100;
            retorno.deslocamentoHorizontalParcial = Math.sqrt((deltaParcialNorte + deltaParcialEste) * 100);
            retorno.deslocamentoHorizontalTotal = Math.sqrt((deltaTotalNorte + deltaTotalEste) * 100);
            retorno.velocidadeHorizontal = (retorno.deslocamentoHorizontalParcial / DiferencaDatas);
            retorno.velocidadeVertical = (retorno.deslocamentoVerticalParcial / DiferencaDatas);

            retorno.sentidoDeslocamentoDirerencaNorte = (MedicaoAtual.norte - MedicaoInicial.norte) * 100;
            retorno.sentidoDeslocamentoDirerencaEste = (MedicaoAtual.este - MedicaoInicial.este) * 100;

            retorno.velocidadeVertical = (retorno.deslocamentoVerticalParcial / DiferencaDatas);

            if (retorno.sentidoDeslocamentoDirerencaNorte > 0)
                retorno.sentidoDeslocamentoNorteSul = "Norte";
            else
                retorno.sentidoDeslocamentoNorteSul = "Sul";

            if (retorno.sentidoDeslocamentoDirerencaNorte > 0)
                retorno.sentidoDeslocamentoNorteSul = "Norte";
            else
                retorno.sentidoDeslocamentoNorteSul = "Sul";


            retorno.criterioAlertaHorizontalMetodologia1 = "Ok"
            for (i = 0; i < alertas.length; i++) {
                if (retorno.velocidadeHorizontal > alertas[i])
                    retorno.criterioAlertaHorizontalMetodologia1 = alertas[i].parametro;

                if (retorno.velocidadeHorizontal > alertas[i])
                    retorno.criterioAlertaHorizontalVertical1 = alertas[i].parametro;
            }
        }

    }
    return retorno;


}
