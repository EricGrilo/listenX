// MODULE
var angularApp = angular.module("angularApp", ["ngResource"]);
var audio;

// Criando um login fake para testar segurança pelo token JWT
var user_email = "teste@gmail.com";
var user_password = "123";

// CONTROLLERS
angularApp.controller("homeController", [
  "$scope",
  "$window",
  "$http",
  function ($scope, $window, $http) {
    $scope.auth = false;
    var d = new Date();
    $scope.showAlertSuccess = false;
    $scope.showAlertError = false;

    $scope.showModal = false;

    // Chamando a API de login para gerar o token
    $http
      .post("api/V1/controller/login.php", {
        email: user_email,
        password: user_password,
      })
      .success(function (data) {
        //Verificar o retorno da API
        if (data == "Não autenticado") {
          $scope.auth = false;
          alert("Usuario não autenticado, lista de musicas não será carregada");
        } else {
          // Caso o usuario esteja correto o token é salvo e a API para leitura das musicas é chamada
          localStorage.setItem("user_token_jwt", data);
          $scope.read();
        }
      })
      .error(function (data, status) {
        alert(data, status);
      });

    $scope.read = function () {
      $http
        .get("api/V1/controller/read.php", {
          headers: { Authorization: localStorage.getItem("user_token_jwt") },
        })
        .success(function (result) {
          // Setando valores para variveis de front-end
          $scope.title = result.title;
          $scope.description = result.description;
          $scope.image_path = result.image_path;
          $scope.lastModified = result.lastModified;
          $scope.valid = result.valid;
          $scope.info = result.info;
          $scope.musicList = result.music;
          $scope.musicCount = $scope.musicList.length;

          // Loop para marcar status da musica como parada
          $scope.musicList.forEach(function (item) {
            item.isPlaying = "stopped";
          });
          // Variavel de controle para mostrar tela no front-end
          $scope.auth = true;
        })
        .error(function (data, status) {});
    };

    // Função para chamada de API para salvar like/dislike
    $scope.saveVote = function (musicList) {
      var validDate = new Date();

      validDate.setDate(validDate.getDate() + 15);

      // Criando um objeto para converter-lo em JSON para envio a API
      // Validade da playlist está dependente da ultima data de atualização
      var obj = {};
      obj.title = $scope.title;
      obj.description = $scope.description;
      obj.image_path = $scope.image_path;
      obj.lastModified = d.toLocaleDateString();
      obj.valid = validDate.toLocaleDateString();
      obj.info = $scope.info;
      obj.music = $scope.musicList;
      // obj.token = localStorage.getItem("user_token_jwt");
      var data = JSON.stringify(obj);
      $http
        .post("api/V1/controller/save.php", data, {
          headers: { Authorization: localStorage.getItem("user_token_jwt") },
        })
        .success(function (result) {
          //Verificação de erros
          if (result.message == "Votos salvos!") {
            // Atualizar variaveis de ultima modificação e validade da playlist
            $scope.lastModified = d.toLocaleDateString();
            $scope.valid = validDate.toLocaleDateString();

            // Mostrar alerta de sucesso e fechar alertas de erro
            $scope.showAlertSuccess = true;
            $scope.showAlertError = false;
          } else {
            // Caso a API tenha encontrado algum erro, como token JWT invalido, mostrar alerta de erro e fechar alerta de sucesso
            $scope.showAlertSuccess = false;
            $scope.showAlertError = true;
            $scope.errorMessage = result.message;
          }
        })
        .error(function (data, status) {
          alert(data, status);
        });
    };

    // Salvar variavel de largura da tela para alterar front-end
    $scope.width = $window.innerWidth;
    angular.element($window).bind("resize", function () {
      $scope.$apply(function () {
        $scope.width = $window.innerWidth;
      });
    });

    $scope.toggleModal = function () {
      $scope.showModal = !$scope.showModal;
    };

    // Função para passar 30 segundos da musica
    $scope.skipTime = function (music) {
      if (music.isPlaying == "playing") {
        audio.currentTime = audio.currentTime + 30;
      }
    };

    //Função para tocar/pausar musica
    $scope.playAudio = function (music) {
      //Salvar status da musica ('playing','paused','stopepd')
      var status = music.isPlaying;

      // Mudando valor de status para todas as musicas para alterar icones e controle sobre play/pause/stop
      $scope.musicList.forEach(function (item) {
        item.isPlaying = "stopped";
      });

      // Caso variavel status não tenha recebido nenhum valor considerar como 'stopped'
      if (!status) {
        status = "stopped";
      }

      // Se audio ja esta definido pausar para evitar conflitos de tocar duas musicas ao mesmo tempo
      if (audio !== undefined) {
        audio.pause();
      }
      if (status == "stopped") {
        // Se musica estiver como stop, inciar um novo objeto de audio e dar play na musica com tempo de 0
        audio = new Audio(music.path);
        audio
          .play()
          .then((result) => {
            // Caso não tenha nenhum problema com o audio colocar status da musica como tocando
            $scope.$apply(function () {
              music.isPlaying = "playing";
            });
          })
          .catch((err) => {
            // Caso exista algum problema ao tocar a musica mostrar alerta de erro e fechar possiveis alertas de sucesso
            $scope.$apply(function () {
              $scope.toggleModal("Success");
            });
          });
      } else if (status == "playing") {
        // Se a musica ja estiver tocando somente pausar o audio
        music.isPlaying = "paused";
        audio.pause();
      } else {
        // Caso a musica esteja com status de pause somente dar play no audio para nao inciar a musica com tempo 0
        audio
          .play()
          .then((result) => {
            // Caso não tenha nenhum problema com o audio colocar status da musica como tocando
            $scope.$apply(function () {
              music.isPlaying = "playing";
            });
          })
          .catch((err) => {
            // Caso exista algum problema ao tocar a musica mostrar alerta de erro e fechar possiveis alertas de sucesso
            $scope.$apply(function () {
              $scope.toggleModal("Success");
            });
          });
      }
    };

    // Função para tratar status Like/Dislike/Neutro da musica
    $scope.statusLike = function (music, click) {
      // Se nao existir esse campo no documento colocar como neutro para evitar erros
      if (!music.liked) {
        music.liked = "neutro";
      }
      if (music.liked === "neutro") {
        if (click === "like") {
          music.liked = "like";
        } else {
          music.liked = "dislike";
        }
      } else if (music.liked === "like") {
        if (click === "like") {
          music.liked = "neutro";
        } else {
          music.liked = "dislike";
        }
      } else {
        if (click === "like") {
          music.liked = "like";
        } else {
          music.liked = "neutro";
        }
      }
    };

    // Botao para fechar alertas
    $scope.dismissAlert = function (isSuccess) {
      if (isSuccess) {
        $scope.showAlertSuccess = false;
      } else {
        $scope.showAlertError = false;
      }
    };
  },
]);

// DIRECTIVES
angularApp.directive("musicCard", function () {
  return {
    restrict: "E",
    templateUrl: "directives/musicCard.html",
    replace: true,
    scope: {
      //   name: "@",
      music: "=",
      playAudio: "&",
      skipTime: "&",
      statusLike: "&",
    },
  };
});
angularApp.directive("musicCardSmall", function () {
  return {
    restrict: "E",
    templateUrl: "directives/musicCardSmall.html",
    replace: true,
    scope: {
      //   name: "@",
      music: "=",
      playAudio: "&",
      skipTime: "&",
      statusLike: "&",
    },
  };
});

angularApp.directive("modal", function () {
  return {
    templateUrl: "directives/modal.html",
    restrict: "E",
    transclude: true,
    replace: true,
    scope: true,
    link: function postLink(scope, element, attrs) {
      scope.$watch(attrs.visible, function (value) {
        if (value == true) $(element).modal("show");
        else $(element).modal("hide");
      });

      $(element).on("shown.bs.modal", function () {
        scope.$apply(function () {
          scope.$parent[attrs.visible] = true;
        });
      });

      $(element).on("hidden.bs.modal", function () {
        scope.$apply(function () {
          scope.$parent[attrs.visible] = false;
        });
      });
    },
  };
});
