<?php 
  // Headers
  header('Access-Control-Allow-Origin: *');
  header('Content-Type: application/json');
  include_once '../model/music.php';
  include_once '../model/auth.php';

  // Instanciar objeto de autorização
  $auth = new Auth();


  // Instanciar objeto de musica
  
  $http_header = apache_request_headers();
  // echo $http_header;

  if (isset($http_header['Authorization']) && $http_header['Authorization'] != null) {
    $token = $http_header['Authorization'];
    if($auth->checkAuth($token)){
      $music = new Music();
      // Chamar função para ler JSON com lista de musicas
      $result = $music->read();
      echo $result;
    } else {
      echo 'Não autorizado';
    }
  } else{
    echo 'Não autorizado';
  } 