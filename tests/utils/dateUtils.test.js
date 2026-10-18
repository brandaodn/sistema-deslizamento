const request = require('supertest');
const { validarDataMenorQueHoje, validarDataInicialMenorQueFinal } = require('../../utils/date.utils');

const mockCurrentDate = (mockDate) => {
  const originalDate = Date;
  
  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        return new originalDate(mockDate);
      }
      return new originalDate(...args);
    }
    
    static now() {
      return new originalDate(mockDate).getTime();
    }
  };
};

const restoreDate = () => {
  global.Date = Date;
};

describe('date.utils.js', () => {
  
  describe('validarDataMenorQueHoje', () => {
    
    beforeEach(() => {
      mockCurrentDate('2024-01-15T12:00:00.000Z');
    });

    afterEach(() => {
      restoreDate();
    });

    it('deve retornar true para data passada válida', () => {
      expect(validarDataMenorQueHoje('2024-01-10')).toBe(true);
      expect(validarDataMenorQueHoje('2023-12-31')).toBe(true);
      expect(validarDataMenorQueHoje('2024-01-14T23:59:59.999Z')).toBe(true);
    });

    it('deve retornar false para data futura', () => {
      expect(validarDataMenorQueHoje('2024-01-16')).toBe(false);
      expect(validarDataMenorQueHoje('2024-02-01')).toBe(false);
      expect(validarDataMenorQueHoje('2024-01-15T12:00:01.000Z')).toBe(false);
    });

    it('deve retornar true para data exatamente igual a hoje', () => {
      expect(validarDataMenorQueHoje('2024-01-15')).toBe(true);
    });

    it('deve retornar false para data inválida', () => {
      expect(validarDataMenorQueHoje('data-invalida')).toBe(false);
      expect(validarDataMenorQueHoje('')).toBe(false);
      expect(validarDataMenorQueHoje(undefined)).toBe(false);
      expect(validarDataMenorQueHoje('2024-13-45')).toBe(false);
    });

    it('deve retornar false para data no formato inválido', () => {
      expect(validarDataMenorQueHoje('15/01/2024')).toBe(false);
    });
  });

  describe('validarDataInicialMenorQueFinal', () => {
    
    it('deve retornar true quando data inicial é menor que final', () => {
      expect(validarDataInicialMenorQueFinal('2024-01-01', '2024-01-02')).toBe(true);
      expect(validarDataInicialMenorQueFinal('2023-12-31', '2024-01-01')).toBe(true);
      expect(validarDataInicialMenorQueFinal('2024-01-01T10:00:00Z', '2024-01-01T11:00:00Z')).toBe(true);
    });

    it('deve retornar false quando data inicial é maior que final', () => {
      expect(validarDataInicialMenorQueFinal('2024-01-02', '2024-01-01')).toBe(false);
      expect(validarDataInicialMenorQueFinal('2024-01-01', '2023-12-31')).toBe(false);
    });

    it('deve retornar false quando datas são iguais', () => {
      expect(validarDataInicialMenorQueFinal('2024-01-01', '2024-01-01')).toBe(false);
    });

    it('deve retornar false para datas inválidas', () => {
      expect(validarDataInicialMenorQueFinal('invalida', '2024-01-01')).toBe(false);
      expect(validarDataInicialMenorQueFinal('2024-01-01', 'invalida')).toBe(false);
      expect(validarDataInicialMenorQueFinal('', '')).toBe(false);
    });
  });
});
