<?php 
  class Music {
    // Propriedades do objeto
    public $title;
    public $description;
    public $image_path;
    public $lastModified;
    public $valid;
    public $info;
    public $music;

    // Função para ler arquivo do JSON
    public function read() {
      $str = file_get_contents('../data/music/musicList.json');

      // Retornar arquivo como array
      $json = json_decode($str, true);
      return $str;      
    }


    // Update do arquivo JSON
    public function update() {
      
      //encode JSON das variaveis do objeto
      $newJsonString = json_encode($this);
      
      // Atualizar arquivo JSON e verificar se ocorreu erros
      if(file_put_contents('../data/music/musicList.json', $newJsonString)){
        return true;
      } else{
        return false;
      }
    }
  }