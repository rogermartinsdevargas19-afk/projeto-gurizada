<?php
// Configuração do banco de dados do Projeto Gurizada.
// Em produção, prefira definir estas variáveis no ambiente do servidor.
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbName = getenv('DB_NAME') ?: 'projeto_gurizada';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conexao = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    $conexao->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    exit('Não foi possível conectar ao banco de dados.');
}
