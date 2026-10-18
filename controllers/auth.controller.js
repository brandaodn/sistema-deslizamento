const bcrypt = require('bcrypt');
const client = require('../db');
const { pagMenu } = require('../utils/menu.utils');
const transactionWrapper = require('../utils/dbTransactions');
const { isStrongPassword, PASSWORD_REQUIREMENTS } = require('../utils/password.utils');

module.exports = {
    showLogin: async (req, res) => {
      if (req.session.user) {
        return res.redirect('/movmassa/menu');
      }

      return res.render('login', { erro: null, email: '' });
    },


    showRegister: async (req, res) => {
        res.render('register', { erro: null, email: '' });
    },

    showMenu: async (req, res) => {
        return pagMenu(res, req, null);
    },

    login: async (req, res) => {
        const { email, senha } = req.body;
        
        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return res.render('login', { erro: ' <p> Usuário não encontrado! </p>', email });
            }

            const user = result.rows[0];
            const isPasswordValid = await bcrypt.compare(senha, user.senha);
            if (!isPasswordValid) {
                return res.render('login', { erro: '<p> Senha inválida! </p>', email });
            }
            
            await new Promise((resolve, reject) => {
                req.session.regenerate(err => err ? reject(err) : resolve());
            });
            req.session.user = {
                email: user.email,
                tipo: user.tipo,
            };
            return pagMenu(res, req, null);
            
        } catch (err) {
            console.error(err);
            res.status(500).render('login', { erro: 'Erro no servidor. Tente novamente mais tarde!', email: '' });
        }
    },

    register: async (req, res) => {
        const {email, senha} = req.body;
        const tipo = 'comum';
        let error = null;
        try {
            await transactionWrapper(client, async () => {
                if (!isStrongPassword(senha)) {
                    error = { view: 'register', data: { erro: `<p> ${PASSWORD_REQUIREMENTS} </p>`, email } };
                    return;
                }

                const hashedPassword = await bcrypt.hash(senha, 10);

                const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
                if (result.rows.length > 0) {
                    error = { view: 'register', data: { erro: "<p> Usuário já cadastrado </p>", email } };
                    return;
                }

                await client.query('INSERT INTO users (tipo, email, senha) VALUES ($1, $2, $3)', [tipo, email, hashedPassword]);
            });
            if (error) {
                return res.render(error.view, error.data);
            }

            await new Promise((resolve, reject) => {
                req.session.regenerate(err => err ? reject(err) : resolve());
            });
            req.session.user = { email, tipo };

            return pagMenu(res, req, `<div class="alert alert-success text-center" role="alert"><p> Usuário cadastrado com sucesso </p></div>`)
        } catch (error) {
            console.error(error);
            return res.status(500).render('register', { erro: "<p> Erro ao cadastrar usuário </p>", email: email });
        }
    },
    
    logout: async (req, res, mensagem) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Erro ao encerrar sessão');
            }

            const cookieName = process.env.SESSION_COOKIE_NAME || 'movmassa.sid';
            const secureCookie = process.env.SESSION_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
            res.clearCookie(cookieName, {
                httpOnly: true,
                sameSite: 'lax',
                secure: secureCookie
            });
            res.redirect('/movmassa/');
        });
  
    }
};