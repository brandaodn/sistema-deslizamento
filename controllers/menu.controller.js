const bcrypt = require('bcrypt');
const client = require('../db');
const transactionWrapper = require('../utils/dbTransactions');

const { pagMenu } = require('../utils/menu.utils');

module.exports = {
    showMenu: async (req, res, mensagem = null) => {
        return pagMenu(res, req, mensagem);
    },

    changePassword: async (req, res) => {
        const { senhaN, senhaV } = req.body;
        let error = null;
        try {
            await transactionWrapper(client, async () => {
                const hashedPasswordN = await bcrypt.hash(senhaN, 10);
               
                const strongPasswordRegex =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=.,?]).{8,}$/;

                if (!strongPasswordRegex.test(senhaN)) {
                    return pagMenu(res, req, `<div class="alert alert-danger text-center" role="alert"><p> A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caracter especial </p></div>`);
                }

                const result = await client.query('SELECT * FROM users WHERE email = $1', [req.session.user.email]);
                const user = result.rows[0];
                
                if (!user) {
                    return pagMenu(res, req, `<div class="alert alert-danger text-center" role="alert"><p> Usuário não encontrado </p></div>`);
                }

                const isPasswordValid = await bcrypt.compare(senhaV, user.senha);

                if (!isPasswordValid) {
                    return pagMenu(res, req, `<div class="alert alert-danger text-center" role="alert"><p> Senha incorreta </p></div>`);
                }

                await client.query('UPDATE users SET senha = $1 WHERE email = $2', [hashedPasswordN, req.session.user.email]);
            });

            if (error) {
                return res.render(error.view, error.data);
            }

            return pagMenu(res, req, `<div class="alert alert-success text-center" role="alert"><p> Senha alterada com sucesso </p></div>`);    
        } catch (error) {
            console.error(error);
            return pagMenu(res, req, `<div class="alert alert-danger text-center" role="alert"><p> Erro ao Alterar senha </p></div>`);
        }
    }
};