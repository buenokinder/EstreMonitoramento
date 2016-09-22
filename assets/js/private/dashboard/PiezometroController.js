app.controller('PiezometroController', ['$scope', '$http', '$filter', 'sennitCommunicationService', function ($scope, $http, $filter, sennitCommunicationService) {
    $scope.data = {};
    $scope.me = window.SAILS_LOCALS;

    $scope.init = function () {
        $scope.data = {
            nivelAtencao: 0,
            nivelAceitavel: 0,
            nivelRegular: 0,
            nivelIntervencao: 0,
            nivelParalisacao: 0
        };
    };

    $scope.showNivelAlerta = function () {
        $('#modalView').openModal();
    };

    $scope.saveNivelAlerta = function () {
        fecharModal('modalView');
    };

    $scope.mustSaveNivelAlerta = function () {
        return $scope.data.nivelAceitavel != 0 && $scope.data.nivelRegular != 0 && $scope.data.nivelAtencao != 0 && $scope.data.nivelIntervencao != 0 && $scope.data.nivelParalisacao != 0 && $scope.data.nivelAceitavel != undefined && $scope.data.nivelRegular != undefined && $scope.data.nivelAtencao != undefined && $scope.data.nivelIntervencao != undefined && $scope.data.nivelParalisacao != undefined;
    }

    $scope.$on('handleBroadcast', function (e, type) {

        switch (sennitCommunicationService.type) {
            case 'select':
                $scope.data = {
                    nivelAtencao: sennitCommunicationService.data.nivelAtencao,
                    nivelAceitavel: sennitCommunicationService.data.nivelAceitavel,
                    nivelRegular: sennitCommunicationService.data.nivelRegular,
                    nivelIntervencao: sennitCommunicationService.data.nivelIntervencao,
                    nivelParalisacao: sennitCommunicationService.data.nivelParalisacao
                };

                break;
            case 'save':

                if ($scope.mustSaveNivelAlerta()) {
                    var params = { id: sennitCommunicationService.data.data.id, nivelAceitavel: $scope.data.nivelAceitavel, nivelRegular: $scope.data.nivelRegular, nivelAtencao: $scope.data.nivelAtencao, nivelIntervencao: $scope.data.nivelIntervencao, nivelParalisacao: $scope.data.nivelParalisacao };

                    $http({
                        method: 'PUT',
                        url: '/Piezometro/' + sennitCommunicationService.data.data.id,
                        data: params
                    }).then(function onSuccess(sailsResponse) {
                        fecharModal("modalView");
                        sennitCommunicationService.prepForBroadcastDataList(sailsResponse);
                        $scope.init();
                    }).catch(function onError(sailsResponse) {
                        swal("Níveis de Alerta", "Ocorreu uma falha ao registrar os níveis de alerta do piezômetro. :(", "error");
                    });
                }
                break;
            case 'new':
                $scope.init();
                break;
        }
 
    });
}]);
