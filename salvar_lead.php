<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/config.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Dados enviados em formato inválido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$nome = trim((string)($data['nome'] ?? ''));
$telefone = trim((string)($data['telefone'] ?? ''));
$modalidade = trim((string)($data['modalidade'] ?? 'Ainda não sei'));
$mensagem = trim((string)($data['mensagem'] ?? ''));
$email = trim((string)($data['email'] ?? ''));

if ($nome === '' || mb_strlen($nome) < 2) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Informe um nome válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$telefoneNumeros = preg_replace('/\D+/', '', $telefone) ?? '';
if (strlen($telefoneNumeros) < 10 || strlen($telefoneNumeros) > 13) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Informe um telefone válido com DDD.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$modalidadesValidas = ['Adulto', 'Infantil', 'Ainda não sei'];
if (!in_array($modalidade, $modalidadesValidas, true)) {
    $modalidade = 'Ainda não sei';
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $email = null;
} elseif ($email === '') {
    $email = null;
}

if (mb_strlen($nome) > 150) {
    $nome = mb_substr($nome, 0, 150);
}
if (mb_strlen($telefone) > 25) {
    $telefone = mb_substr($telefone, 0, 25);
}
if (mb_strlen($mensagem) > 5000) {
    $mensagem = mb_substr($mensagem, 0, 5000);
}

try {
    $stmt = $conexao->prepare(
        'INSERT INTO leads (nome, email, telefone, modalidade, mensagem) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssss', $nome, $email, $telefone, $modalidade, $mensagem);
    $stmt->execute();
    $id = $stmt->insert_id;
    $stmt->close();
    $conexao->close();

    echo json_encode([
        'status' => 'success',
        'message' => 'Cadastro recebido com sucesso.',
        'id' => $id
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('Projeto Gurizada - erro ao salvar lead: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Não foi possível salvar o cadastro agora.'
    ], JSON_UNESCAPED_UNICODE);
}
