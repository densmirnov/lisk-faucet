angular.module("faucet", ['ngFx', 'vcRecaptcha'])
.controller("mainController", ["$rootScope", "$scope", "$http", "$timeout", "$interval", "vcRecaptchaService", function ($rootScope, $scope, $http, $timeout, $interval, vcRecaptchaService) {
        $scope.getBase = function () {
            $scope.error = null;

            $http.get("/api/getBase").then(function (resp) {
                $scope.error = null;

                if (resp.data && resp.data.success) {
                    $scope.available = resp.data.balance;
                    $scope.amount = resp.data.amount;
                    $scope.donation_address = resp.data.donation_address;
                    $scope.blockHideForm = false;
                    $scope.captcha_key = resp.data.captcha_key;
                    $scope.totalCount = resp.data.totalCount;
                } else {
                    $scope.blockHideForm = true;
                    if (resp.data && resp.data.error) {
                        $scope.error = resp.data.error;
                    } else {
                        $scope.error = "faucet node is offline, try later please";
                    }
                }
            });
        }

        $scope.send = function () {
            $scope.error = null;
            $scope.txId = null;
            $scope.loading = true;

            $http.post("/api/sendLisk", {
                address : $scope.address,
                captcha : vcRecaptchaService.getResponse()
            }).then(function (resp) {
                $scope.loading = false;
                $scope.error = null;

                if (resp.data && resp.data.success) {
                    $scope.txId = resp.data.txId;
                    $scope.address = "";
                    vcRecaptchaService.reload();
                    $scope.getBase();
                } else {
                    if (resp.data && resp.data.error) {
                        $scope.error = resp.data.error;
                    } else {
                        $scope.error = "faucet node is offline, try later please";
                    }

                    vcRecaptchaService.reload();
                }
            });
        }

        $scope.getBase();
        $interval(function () {
            $scope.getBase();
        }, 1000 * 60);
    }]);
