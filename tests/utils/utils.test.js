const { validarCampos, processCheckboxes } = require('../../utils/utils');

describe('Testes para utils.js', () => {
  describe('validarCampos', () => {
    it('deve converter strings vazias para null', () => {
      const campos = {
        nome: 'João',
        email: '',
        idade: 25,
        endereco: ''
      };

      validarCampos(campos);

      expect(campos.nome).toBe('João');
      expect(campos.email).toBeNull();
      expect(campos.idade).toBe(25);
      expect(campos.endereco).toBeNull();
    });

    it('deve converter string "true" para boolean true', () => {
      const campos = {
        ativo: 'true',
        admin: 'true',
        nome: 'Maria'
      };

      validarCampos(campos);

      expect(campos.ativo).toBe(true);
      expect(campos.admin).toBe(true);
      expect(campos.nome).toBe('Maria');
    });

    it('deve converter string "false" para boolean false', () => {
      const campos = {
        ativo: 'false',
        bloqueado: 'false',
        status: 'inativo'
      };

      validarCampos(campos);

      expect(campos.ativo).toBe(false);
      expect(campos.bloqueado).toBe(false);
      expect(campos.status).toBe('inativo');
    });

    it('deve processar múltiplas conversões no mesmo objeto', () => {
      const campos = {
        nome: '',
        ativo: 'true',
        vip: 'false',
        idade: '',
        saldo: 100.50,
        tags: ['a', 'b']
      };

      validarCampos(campos);

      expect(campos.nome).toBeNull();
      expect(campos.ativo).toBe(true);
      expect(campos.vip).toBe(false);
      expect(campos.idade).toBeNull();
      expect(campos.saldo).toBe(100.50);
      expect(campos.tags).toEqual(['a', 'b']);
    });

    it('deve lidar com objeto vazio', () => {
      const campos = {};
      
      expect(() => validarCampos(campos)).not.toThrow();
      expect(Object.keys(campos)).toHaveLength(0);
    });

  });

  describe('processCheckboxes', () => {
    it('deve retornar null quando o campo é falsy (exceto array vazio)', () => {
      expect(processCheckboxes(null)).toBeNull();
      expect(processCheckboxes(undefined)).toBeNull();
      expect(processCheckboxes('')).toBeNull();
      expect(processCheckboxes(0)).toBeNull();
      expect(processCheckboxes(false)).toBeNull();
    });

    it('deve retornar array com o valor quando não é array', () => {
      expect(processCheckboxes('valor1')).toEqual(['valor1']);
      expect(processCheckboxes(123)).toEqual([123]);
      expect(processCheckboxes(true)).toEqual([true]);
      expect(processCheckboxes({ id: 1 })).toEqual([{ id: 1 }]);
    });

    it('deve retornar o próprio array quando já for array', () => {
      const arraySimples = ['a', 'b', 'c'];
      const arrayComObjetos = [{ id: 1 }, { id: 2 }];
      const arrayVazio = [];
      const arrayComValoresMistos = [1, 'texto', true, null];

      expect(processCheckboxes(arraySimples)).toBe(arraySimples); 
      expect(processCheckboxes(arrayComObjetos)).toBe(arrayComObjetos);
      expect(processCheckboxes(arrayVazio)).toBe(arrayVazio);
      expect(processCheckboxes(arrayComValoresMistos)).toBe(arrayComValoresMistos);
    });

    it('deve manter valores individuais dentro de arrays', () => {
      const valorString = 'opcao1';
      const valorNumero = 42;
      const valorBoolean = true;
      const valorNulo = null;
      const valorObjeto = { nome: 'teste' };

      expect(processCheckboxes(valorString)).toEqual(['opcao1']);
      expect(processCheckboxes(valorNumero)).toEqual([42]);
      expect(processCheckboxes(valorBoolean)).toEqual([true]);
      expect(processCheckboxes(valorNulo)).toBeNull(); 
      expect(processCheckboxes(valorObjeto)).toEqual([{ nome: 'teste' }]);
    });

    it('deve lidar com arrays aninhados (mantém como está)', () => {
      const arrayAninhado = [['a', 'b'], ['c']];
      const resultado = processCheckboxes(arrayAninhado);
      
      expect(resultado).toBe(arrayAninhado);
      expect(resultado).toEqual([['a', 'b'], ['c']]);
    });

    it('deve tratar string vazia como null', () => {
      expect(processCheckboxes('')).toBeNull();
    });

    it('deve tratar zero como null', () => {
      expect(processCheckboxes(0)).toBeNull();
    });

    it('deve tratar false como null', () => {
      expect(processCheckboxes(false)).toBeNull();
    });

  });
});