const STRONG_PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=.,?]).{8,}$/;

const PASSWORD_REQUIREMENTS =
    'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caracter especial';

function isStrongPassword(password) {
    return typeof password === 'string' && STRONG_PASSWORD_REGEX.test(password);
}

module.exports = { isStrongPassword, PASSWORD_REQUIREMENTS };
