-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 14/10/2026 às 00:18
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `bd-pi-ii`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `cliente`
--

CREATE TABLE `cliente` (
  `id` int(11) NOT NULL,
  `nome` varchar(80) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `colaborador`
--

CREATE TABLE `colaborador` (
  `id` int(11) NOT NULL,
  `nome` varchar(80) NOT NULL,
  `funcao` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pacote`
--

CREATE TABLE `pacote` (
  `id` int(11) NOT NULL,
  `nome` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `produto`
--

CREATE TABLE `produto` (
  `id` int(11) NOT NULL,
  `nome` varchar(80) NOT NULL,
  `descricao` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reserva_agendamento`
--

CREATE TABLE `reserva_agendamento` (
  `id` int(11) NOT NULL,
  `solicitacao_id` int(11) DEFAULT NULL,
  `cliente_id` int(11) NOT NULL,
  `data_evento` date NOT NULL,
  `numero_contrato` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reserva_colaborador`
--

CREATE TABLE `reserva_colaborador` (
  `reserva_id` int(11) NOT NULL,
  `colaborador_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reserva_item`
--

CREATE TABLE `reserva_item` (
  `reserva_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `solicitacao_agendamento`
--

CREATE TABLE `solicitacao_agendamento` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `descricao_evento` text NOT NULL,
  `data_evento` date NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `solicitacao_item`
--

CREATE TABLE `solicitacao_item` (
  `solicitacao_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `colaborador`
--
ALTER TABLE `colaborador`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `pacote`
--
ALTER TABLE `pacote`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `reserva_agendamento`
--
ALTER TABLE `reserva_agendamento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reserva_solicitacao` (`solicitacao_id`),
  ADD KEY `fk_reserva_cliente` (`cliente_id`);

--
-- Índices de tabela `reserva_colaborador`
--
ALTER TABLE `reserva_colaborador`
  ADD PRIMARY KEY (`reserva_id`,`colaborador_id`),
  ADD KEY `fk_reserva_colaborador_colaborador` (`colaborador_id`);

--
-- Índices de tabela `reserva_item`
--
ALTER TABLE `reserva_item`
  ADD PRIMARY KEY (`reserva_id`,`produto_id`),
  ADD KEY `fk_reserva_item_produto` (`produto_id`);

--
-- Índices de tabela `solicitacao_agendamento`
--
ALTER TABLE `solicitacao_agendamento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_solicitacao_cliente` (`cliente_id`);

--
-- Índices de tabela `solicitacao_item`
--
ALTER TABLE `solicitacao_item`
  ADD PRIMARY KEY (`solicitacao_id`,`produto_id`),
  ADD KEY `fk_solicitacao_item_produto` (`produto_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `colaborador`
--
ALTER TABLE `colaborador`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pacote`
--
ALTER TABLE `pacote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `reserva_agendamento`
--
ALTER TABLE `reserva_agendamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `solicitacao_agendamento`
--
ALTER TABLE `solicitacao_agendamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `reserva_agendamento`
--
ALTER TABLE `reserva_agendamento`
  ADD CONSTRAINT `fk_reserva_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_reserva_solicitacao` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao_agendamento` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `reserva_colaborador`
--
ALTER TABLE `reserva_colaborador`
  ADD CONSTRAINT `fk_reserva_colaborador_colaborador` FOREIGN KEY (`colaborador_id`) REFERENCES `colaborador` (`id`),
  ADD CONSTRAINT `fk_reserva_colaborador_reserva` FOREIGN KEY (`reserva_id`) REFERENCES `reserva_agendamento` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `reserva_item`
--
ALTER TABLE `reserva_item`
  ADD CONSTRAINT `fk_reserva_item_produto` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`),
  ADD CONSTRAINT `fk_reserva_item_reserva` FOREIGN KEY (`reserva_id`) REFERENCES `reserva_agendamento` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `solicitacao_agendamento`
--
ALTER TABLE `solicitacao_agendamento`
  ADD CONSTRAINT `fk_solicitacao_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`);

--
-- Restrições para tabelas `solicitacao_item`
--
ALTER TABLE `solicitacao_item`
  ADD CONSTRAINT `fk_solicitacao_item_produto` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`),
  ADD CONSTRAINT `fk_solicitacao_item_solicitacao` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao_agendamento` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
