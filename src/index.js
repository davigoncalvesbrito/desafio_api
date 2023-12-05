const express = require('express');
const porta = 3000;
const rotas = require('./rotas'); // REQUERENDO AS ROTAS
const servidor = express(); 

servidor.use(express.json());
servidor.use(rotas); // Adicionar as rotas ao servidor


servidor.listen(porta, () => {
  console.log(`Servidor Funcionando http://localhost:${porta}`);
});
