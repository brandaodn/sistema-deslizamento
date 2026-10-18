const bcrypt = require('bcrypt');
const client = require('../db');
const { pagMenu } = require('../utils/menu.utils');
const { isStrongPassword, PASSWORD_REQUIREMENTS } = require('../utils/password.utils');

module.exports = {
    showMenu: async (req, res, mensagem = null) => {
        return pagMenu(res, req, mensagem);
    },

    changePassword: async (req, res) => {
        const { senhaN, senhaV } = req.body;

        try {
            if (!isStrongPassword(senhaN)) {
                return pagMenu(
                    res,
                    req,
                    `<div class="alert alert-danger text-center" role="alert"><p> ${PASSWORD_REQUIREMENTS} </p></div>`
                );
            }

            const result = await client.query(
                'SELECT senha FROM users WHERE email = $1',
                [req.session.user.email]
            );
            const user = result.rows[0];

            if (!user) {
                return pagMenu(
                    res,
                    req,
                    '<div class="alert alert-danger text-center" role="alert"><p> Usuário não encontrado </p></div>'
                );
            }

            const isPasswordValid = await bcrypt.compare(senhaV, user.senha);
            if (!isPasswordValid) {
                return pagMenu(
                    res,
                    req,
                    '<div class="alert alert-danger text-center" role="alert"><p> Senha incorreta </p></div>'
                );
            }

            const hashedPasswordN = await bcrypt.hash(senhaN, 10);
            await client.query(
                'UPDATE users SET senha = $1 WHERE email = $2',
                [hashedPasswordN, req.session.user.email]
            );

            return pagMenu(
                res,
                req,
                '<div class="alert alert-success text-center" role="alert"><p> Senha alterada com sucesso </p></div>'
            );
        } catch (error) {
            console.error(error);
            return pagMenu(
                res,
                req,
                '<div class="alert alert-danger text-center" role="alert"><p> Erro ao alterar senha </p></div>'
            );
        }
    }
};
