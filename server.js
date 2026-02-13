require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado com sucesso!"))
  .catch(err => console.error("Erro ao conectar:", err));


const express = require('express');
const nodemailer = require("nodemailer");
const app = express();
const cors = require('cors');
app.use(cors({
    origin: 'https://nic0libatista.github.io',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
})); 
app.use(express.json()); 

const Produto = require('./models/produto'); 

// Rota para buscar todos os produtos do cardápio
app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await Produto.find(); 
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar produtos" });
    }
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Rota para receber o pedido do front-end
app.post('/api/finalizar-pedido', (req, res) => {
    const { cliente, emailCliente, endereco, pagamento, itens, total } = req.body;
    // lista produtos
    const listaItensHtml = itens.map(item => `
        <li>
            <strong>${item.nome}</strong> - R$ ${item.preco.toFixed(2).replace('.', ',')}
        </li>
    `).join(''); 
    const mailOptions = {
        from: '"Casa do Barista" <nicolisantosbatista@gmail.com>',
        to: `nicolisantosbatista@gmail.com, ${emailCliente}`,
        subject: `Confirmação de Pedido - ${cliente}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #4b2c20;">Olá, ${cliente}!</h1>
                <p>Seu pedido foi recebido com sucesso e já está sendo preparado.</p>
                
                <h3 style="border-bottom: 1px solid #ccc;">Resumo do Pedido:</h3>
                <ul>
                    ${listaItensHtml}
                </ul>
                
                <p><strong>Total:</strong> R$ ${total}</p>
                <p><strong>Forma de Pagamento:</strong> ${pagamento}</p>
                <p><strong>Endereço de Entrega:</strong> ${endereco}</p>
                
                <hr>
                <p style="font-size: 0.9em; color: #666;">Obrigado por comprar na <strong>Casa do Barista</strong>!</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (erro, info) => { 
        if (erro) {
            console.error("Erro no Nodemailer:", erro);
            return res.status(500).send("Erro ao enviar e-mail.");
        }
        res.status(200).send('Pedido enviado com sucesso!');
    });
});



app.listen(3000, () => console.log("Servidor rodando na porta 3000"));