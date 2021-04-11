<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
include_once '../model/auth.php';

// Instanciar objeto de autorizaçaõ
$auth = new Auth();

// Retirar dados do post
$data = json_decode(file_get_contents("php://input"));
$auth->email = $data->email;
$auth->password = $data->password;

// Chamada de função para autenticar o usuario e retornar token JWT
$token = $auth->login();
if($token != 'Não autenticado') {
    echo $token;
  } else {
    echo "Não autenticado";
  }