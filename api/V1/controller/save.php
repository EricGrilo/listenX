<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
include_once '../model/music.php';
include_once '../model/auth.php';

// Instanciar objeto de autorização
$auth = new Auth();

// Pegar dados POST
$http_header = apache_request_headers();
$data = json_decode(file_get_contents("php://input"));

if (isset($http_header['Authorization']) && $http_header['Authorization'] != null) {
  $token = $http_header['Authorization'];
  // Verificar se token enviado é valido
  if($auth->checkAuth($token)){
    //Se for valido instanciar objeto de musica e dar valor as suas variaveis 
    $music = new Music();
    $music->title = $data->title;
    $music->description = $data->description;
    $music->image_path = $data->image_path;
    $music->lastModified = $data->lastModified;
    $music->valid = $data->valid;
    $music->info = $data->info;
    $music->music = $data->music;
    //Chamada de função para salvar votos da playlist e verificação de erros
    if($music->update()) {
        echo json_encode(
          array('message' => 'Votos salvos!')
        );
      } else {
        echo json_encode(
          array('message' => 'Não foi possível salvar seus votos, tente novamente mais tarde')
        );
      }
  } else{
    //Caso token enviado seja invalido retornar mensagem de não autorizado
    echo json_encode(
          array('message' => "Não autorizado")
        );
  }
} else {
  json_encode(
          array('message' => "Não autorizado")
        );
}