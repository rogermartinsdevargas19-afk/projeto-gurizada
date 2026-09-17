-- Banco de dados do Projeto Gurizada
-- Execute este arquivo no MySQL / MariaDB.

CREATE DATABASE IF NOT EXISTS projeto_gurizada
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE projeto_gurizada;

CREATE TABLE IF NOT EXISTS leads (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NULL,
    telefone VARCHAR(25) NOT NULL,
    modalidade ENUM('Adulto', 'Infantil', 'Ainda não sei') NOT NULL DEFAULT 'Ainda não sei',
    mensagem TEXT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_telefone (telefone),
    KEY idx_modalidade (modalidade),
    KEY idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
