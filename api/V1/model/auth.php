<?php

class Auth {
        private static $key = '123456'; //Chave de aplicação

        public $email;
        public $password;
        
        //Função para aunticar usuario
        public function login(){

            //Como aplicação não possui sistema de login comparar valores enviados à API com valores fixos
            if ($this->email == 'teste@gmail.com' && $this->password == '123') {
                //Header Token
                $header = [
                    'typ' => 'JWT',
                    'alg' => 'HS256'
                ];

                //Payload - Content
                $payload = [
                    'name' => 'Eric Araujo',
                    'email' => $this->email,
                ];

                //JSON
                $header = json_encode($header);
                $payload = json_encode($payload);

                //Base 64
                $header = self::base64UrlEncode($header);
                $payload = self::base64UrlEncode($payload);

                //Sign
                $sign = hash_hmac('sha256', $header . "." . $payload, self::$key, true);
                $sign = self::base64UrlEncode($sign);

                //Token
                $token = $header . '.' . $payload . '.' . $sign;

                return $token;
            }
            
            return "Não autenticado";

        }

        // Função para verificar token enviado à API's
        public static function checkAuth($bearer)
        {

                $token = explode('.', $bearer);
                $header = $token[0];
                $payload = $token[1];
                $sign = $token[2];

                //Conferir Assinatura
                $valid = hash_hmac('sha256', $header . "." . $payload, self::$key, true);
                $valid = self::base64UrlEncode($valid);

                if ($sign === $valid) {
                    return true;
                }
            

            return false;
        }
        
        
        // Função para fazer encode de dados
        private static function base64UrlEncode($data)
        {
            // First of all you should encode $data to Base64 string
            $b64 = base64_encode($data);

            // Make sure you get a valid result, otherwise, return FALSE, as the base64_encode() function do
            if ($b64 === false) {
                return false;
            }

            // Convert Base64 to Base64URL by replacing “+” with “-” and “/” with “_”
            $url = strtr($b64, '+/', '-_');

            // Remove padding character from the end of line and return the Base64URL result
            return rtrim($url, '=');
        }
    }