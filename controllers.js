var apka = angular.module('apka', ['ngRoute','ngCookies','uiGmapgoogle-maps']);



/////////////////////////////////////////////////////////////////////////////////
//KONTROLER SAMEJ MAPY
/////////////////////////////////////////////////////////////////////////////////



apka.controller('mainCtrl', function($scope) {
  $scope.map = {center: {latitude: 52.23, longitude: 21.01 }, zoom: 12 };
  $scope.lati="Punkt";
  $scope.long="nieznany";
  $scope.buttonDisabled=1;
    
  $scope.marker = [ //jakies pierwsze przykladowe punkty
    {
      id: 0,
      name: "Punkt0",
      coords: {
        latitude: 52.235,
        longitude: 21.012
      },
      options: { draggable: false },
    },
    {
          id: 1,
          name: "Punkt2",
      coords: {
        latitude: 52.238,
        longitude: 21.012
      },
      options: { draggable: false },
    }
  ];
    
       
  if (navigator.geolocation) { //proba geolokalizacji
    navigator.geolocation.getCurrentPosition(showPosition); //jesli sie udalo - uruchamia funkcje showPosition
  }      
    
  function showPosition(position) { //zmienna position ma w sobie wspolrzedne
    $scope.buttonDisabled=0;
    $scope.lati=position.coords.latitude;
    $scope.long=position.coords.longitude;
      
    $scope.marker[2]= {
      id:99,
      name: "Aktualna lokalizacja",
      coords: {
        latitude:position.coords.latitude,
        longitude:position.coords.longitude
      },
      icon: "http://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png", //na razie nie dziala
      options: {draggable:false },
        
    };
      
    $scope.$apply(); //odswiezenie angulara
  }
    

    
  $scope.dodaj = function() {
    var url="http://45.76.87.200/add/user/points?latitude="+$scope.lati+"&logitute"+$scope.long+"&name="+ $scope.nazwa;
    alert(url);
    
    var res = $http.get(url);
    res.then(function successCallback(response) {
      $scope.msg="Dodano punkt";
    
    }, function errorCallback(response) {
      $scope.msg="Nie dodano punktu";
    });
  }
 
        
});








/////////////////////////////////////////////////////////////////////////////////
//KONTROLER LOGOWANIA
/////////////////////////////////////////////////////////////////////////////////


apka.controller('kontrolerZaloguj',fKontrolerZaloguj);
function fKontrolerZaloguj($scope,$http,$cookies,$location) {

  if($cookies.log==1) $scope.zalogowany="Jesteś już zalogowany! Przejdź do <a href='#!'>mapy</a>";
  
  $scope.zaloguj = function() { //proba zalogowania
  
    var url2="http://45.76.87.200/login/user?login="+$scope.login+"&passhash="+ $scope.pswd+"&jsonp=JSON_CALLBACK";

    $http({
      method: 'GET',
      url: url2,
      withCredentials: true
      }).then(function successCallback(response) { //sukces
          var logCookie = $cookies.log; //zmienna ciasteczkowa
          $cookies.log = 1;
          $cookies.login=$scope.login;
          $location.path('mapa'); //przeniesienie do podstrony mapy
      }, function errorCallback(response) { //porazka
        $scope.msg="Niepoprawny login lub haslo.";
    });

  }
}

/////////////////////////////////////////////////////////////////////////////////
//KONTROLER REJESTRACJI
/////////////////////////////////////////////////////////////////////////////////

apka.controller('kontrolerRejestracja',fKontrolerRejestracja);
function fKontrolerRejestracja($scope,$http,$cookies) {

  if($cookies.log==1) $scope.zalogowany="Jesteś już zalogowany! Przejdź do <a href='#!'>mapy</a>";
  
  $scope.zarejestruj = function() {
  
    if($scope.pswd1==$scope.pswd2) {

      var url="http://45.76.87.200/add/user?login="+$scope.login+"&passhash="+ $scope.pswd1;
      var res = $http.get(url);
      res.then(function successCallback(response) {
        $scope.msg="Dodano uzytkownika. Mozesz sie teraz zalogowac.";
      
      }, function errorCallback(response) {
        $scope.msg="Taki uzytkownik juz istnieje w bazie!";
      });
  
    }
    else $scope.msg="Hasla nie sa zgodne.";
      
  }

}



/////////////////////////////////////////////////////////////////////////////////
//KONTROLER MAPY (PODSTRONY)
/////////////////////////////////////////////////////////////////////////////////


apka.controller('kontrolerMapa',fKontrolerMapa);
function fKontrolerMapa($scope,$http,$cookies,$location) {


  if($cookies.log==1) $scope.login=$cookies.login;
  else $location.path('zaloguj');
  

  $scope.wyloguj = function() {
    $cookies.log = 0;
    $cookies.login="";
    $location.path('zaloguj');
  }

}