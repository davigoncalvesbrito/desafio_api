const express = require('express');
const fs = require('fs');
const path = require('path');
const alunoModel = require('./modelos/Alunos');

const rotas = express.Router();
// rotas.use(express.json());

const arquivoJsonAlunos = path.join(__dirname, 'database', 'alunos.json');


/* ---------- ROTA GET COM PAGINAÇÃO INCLUSA---------- */
rotas.get('/alunos', (req, res) => {
    // Lê o arquivo JSON
    const jsonAlunos = require('./database/alunos.json');

    // Parâmetros de paginação 
    const pagina = parseInt(req.query.page) || 1; // Número da página  Se não for fornecido, assume 1 como valor padrão
    const tamanhoPagina = parseInt(req.query.pageSize) || 10; // Tamanho de arquivos por  página  Se não for fornecido, assume 10 como valor padrão

    // Calcula o índice inicial e final para a página atual
    const indexInicial = (pagina - 1) * tamanhoPagina; // Calcula o índice inicial para a página atual.
    const indexFinal = indexInicial + tamanhoPagina;  // Calcula o índice final para a página atual.

    // Obtém os alunos da página atual usando slice
    const paginaAtual = jsonAlunos.slice(indexInicial, indexFinal); // Usa  o método slice para  extrair o conjunto correto de alunos do array 'jsonAlunos'

    // Calcula URLs da próxima e da página anterior
    const itensTotal = jsonAlunos.length;
    const paginasTotais = Math.ceil(itensTotal / tamanhoPagina);

    // URL da próxima página
    const proximaPagina = pagina < paginasTotais ? `/alunos?page=${pagina + 1}&pageSize=${tamanhoPagina}` : null;
    // URL da página anterior
    const paginaAnterior = pagina > 1 ? `/alunos?page=${pagina - 1}&pageSize=${tamanhoPagina}` : null;
   
    res.status(200).json({  // Envia uma resposta JSON contendo informações sobre a página atual e os alunos dessa página.
        pagina: pagina,
        tamanhoPagina: tamanhoPagina,
        itensTotal: itensTotal,
        paginasTotais: paginasTotais,
        proximaPagina: proximaPagina,
        paginaAnterior: paginaAnterior,
        data: paginaAtual,
    });
});

/* ----------ROTA POST --------->  */
rotas.post('/addAluno', (req, res) => {
    // jsonAlunos para dentro do escopo da rota
    const jsonAlunos = require('./database/alunos.json');
    
    const { nome,idade, cpf, email } = req.body;
    let alunoId = jsonAlunos.length + 1; //Adicionando ID dos alunos dinamicamente

    console.log('Parâmetros recebidos:', alunoId, nome, idade, cpf, email);
    const novoAluno = new alunoModel(alunoId,nome,idade,cpf,email);
    jsonAlunos.push(novoAluno);

    try {
        fs.writeFileSync(arquivoJsonAlunos, JSON.stringify(jsonAlunos, null, 2), 'utf8');
        res.status(201).json({ message: 'Aluno adicionado com sucesso', aluno: novoAluno });
    } catch (error) {
        console.error('Erro ao escrever no arquivo JSON de alunos:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});


/* ---------- ROTA DELETE ---------- */
rotas.delete('/deleteAluno/:id', (req, res) => {
  const alunoId = parseInt(req.params.id);
  const jsonAlunos = require('./database/alunos.json');
  

  // Encontrar o índice do aluno com base no ID
  const alunoIndex = jsonAlunos.findIndex(aluno => aluno.id === alunoId);

  // Verificar se o aluno foi encontrado
  if (alunoIndex !== -1) {
      // Remover o aluno da lista
      const alunoRemovido = jsonAlunos.splice(alunoIndex, 1);

      // Escrever de volta no arquivo JSON
      try {
          fs.writeFileSync(arquivoJsonAlunos, JSON.stringify(jsonAlunos, null, 2), 'utf8');
          res.status(200).json({ message: 'Aluno removido com sucesso', aluno: alunoRemovido });
      } catch (error) {
          console.error('Erro ao escrever no arquivo JSON de alunos:', error.message);
          res.status(500).json({ message: 'Erro interno do servidor' });
      }
  } else {
      res.status(404).json({ message: 'Não existe aluno cadastrado com esse id.' });
  }
});


/* ---------- ROTA PUT ---------- */
rotas.put('/editarAluno/:id', (req, res) => {
    const alunoId = parseInt(req.params.id);
    const { nome, idade, cpf, email } = req.body;
    const jsonAlunos = require('./database/alunos.json');

    const alunoIndex = jsonAlunos.findIndex(aluno => aluno.id === alunoId);

    if (alunoIndex !== -1) {
        // Atualizar apenas os campos fornecidos no corpo da solicitação
        const alunoAtualizado = jsonAlunos[alunoIndex];
        if (nome) {
            alunoAtualizado.nome = nome;
        }
        if (idade) {
            alunoAtualizado.idade = idade;
        }
        if (cpf ) {
            alunoAtualizado.cpf = cpf;
        }
        if (email ) {
            alunoAtualizado.email = email;
        }

        // Escrever de volta no arquivo JSON
        try {
            fs.writeFileSync(arquivoJsonAlunos, JSON.stringify(jsonAlunos, null, 2), 'utf8');
            res.status(200).json({ message: 'Aluno atualizado com sucesso', aluno: alunoAtualizado });
        } catch (error) {
            console.error('Erro ao escrever no arquivo JSON de alunos:', error.message);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        res.status(404).json({ message: 'Não existe aluno a ser alterado para o ID informado.' });
    }
});


module.exports = rotas;


