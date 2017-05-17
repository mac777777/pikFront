var apka = angular.module('apka', ['ngRoute','ngCookies','uiGmapgoogle-maps']);

apka.config(
    ['uiGmapGoogleMapApiProvider', function(GoogleMapApiProviders) {
        GoogleMapApiProviders.configure({
            key: 'AIzaSyDX1wDnU65Eq_WKGLh7EbzBP4lNvg5iIKQ'
        });
        }
    ]);


/////////////////////////////////////////////////////////////////////////////////
//KONTROLER SAMEJ MAPY
/////////////////////////////////////////////////////////////////////////////////



apka.controller('mainCtrl', function($scope, $cookies,$http) {
  $scope.map = {center: {latitude: 52.23, longitude: 21.01 }, zoom: 12 };
  $scope.lati="Punkt";
  $scope.long="nieznany - nie udostępniono informacji o położeniu";
  $scope.buttonDisabled=1;
  
  var obj;
  
  //$scope.msg="";
  $scope.msgload="";
  $scope.point="-";

  /*  $scope.marker = [ //jakies pierwsze przykladowe punkty
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
  */
  
  $scope.marker2 = [];
  
  function loadPoints() {
 
  
   var result = $http.get("http://localhost:8080/get/points");
    result.then(function successCallback(response) {

      //$scope.msgload=response;
     
      for (i = 0; i < response.data.length; i++) {
      
        $scope.marker2[i]={
          id:response.data[i].id,
          name:response.data[i].name,
          date:response.data[i].date,
          coords: {
            latitude: response.data[i].latitude,
            longitude: response.data[i].longitude
          },
          events: {
            click: function(marker, eventName, model) {
              var text=model.name + "(" + model.coords.latitude + "," + model.coords.longitude + ") - " + model.date;
              $scope.point=text;
            }
          },
          options: {
          draggable:false,
          }
        };

        if($scope.marker2[i].date==null) $scope.marker2[i].date="[nieznana]";
          else {
            var datex=$scope.marker2[i].date;
            var text=datex.getDay() + "." + datex.getMonth() + "." + datex.getFullYear();
            $scope.marker2[i].date=text;
        }
      }
      
      $scope.$apply();
      
    
      }, function errorCallback(response) {
        $scope.msgload="Problem z polaczeniem z serwerem.";
      });
    
    }
    
    window.onload = loadPoints();

  

       
  if (navigator.geolocation) { //proba geolokalizacji
    navigator.geolocation.getCurrentPosition(showPosition); //jesli sie udalo - uruchamia funkcje showPosition
  }      
    
  function showPosition(position) { //zmienna position ma w sobie wspolrzedne
    $scope.buttonDisabled=0;
    $scope.lati=position.coords.latitude;
    $scope.long=position.coords.longitude;
    
      var newid=$scope.marker2.length;
      
    $scope.marker2[newid]= {
      id:newid+1,
      name: "Aktualna lokalizacja",
      date: "[teraz]",
      coords: {
        latitude:position.coords.latitude,
        longitude:position.coords.longitude
      },
      //icon: "http://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png", //na razie nie dziala
      options: {draggable:false,
      icon:'marker.png'
      },
        
    };
      
    $scope.$apply(); //odswiezenie angulara
  }
    
  $scope.msg="";  

    
  $scope.dodaj = function() {
    var url3="http://localhost:8080/add/user/points?latitude="+$scope.lati+"&longitude="+$scope.long+"&name="+ $scope.nazwa+"&login="+$cookies.login+"&jsonp=JSON_CALLBACK";
        $http({
      method: 'GET',
      url: url3,
      withCredentials: true
      }).then(function successCallback(response) { //sukces
          $scope.msg="Punkt zostal dodany!";
          loadPoints();
      }, function errorCallback(response) { //porazka
        $scope.msg="Wystapil blad!";
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
  
    var url2="http://localhost:8080/login/user?login="+$scope.login+"&passhash="+ $scope.pswd+"&jsonp=JSON_CALLBACK";

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

      var url="http://localhost:8080/add/user?login="+$scope.login+"&passhash="+ $scope.pswd1;
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
  
    var url="http://localhost:8080/logout/user?login="+$scope.login;
    var res = $http.get(url);
    $cookies.log = 0;
    $cookies.login="";
    $location.path('zaloguj');
  }

}