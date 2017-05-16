apka.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 's_logowanie.html',
                controller: 'kontrolerZaloguj'
            }, null)
            .when('/zaloguj', {
                templateUrl: 's_logowanie.html',
                controller: 'kontrolerZaloguj'
            }, null)
            .when('/l', {
                templateUrl: 'ex2.html',
                controller: 'kkon2'
            }, null)
            .when('/rejestracja', {
                templateUrl: 's_rejestracja.html',
                controller: 'kontrolerRejestracja'
            }, null)
            .when('/mapa', {
                templateUrl: 's_mapa.html',
                controller: 'kontrolerMapa'
            }, null);
    }]);