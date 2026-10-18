-- TABELAS RELACIONADAS A MOVIMENTOS DE MASSA


-- Tabela País: Armazena os países cadastrados
CREATE TABLE pais (
    id_pais SERIAL PRIMARY KEY,
    nome_pais TEXT NOT NULL UNIQUE
);


-- Tabela UF: Armazena os UFs cadastrados e a qual país ele pertence
CREATE TABLE uf (
    id_uf SERIAL PRIMARY KEY,
    nome_uf TEXT NOT NULL,
    id_pais INT NOT NULL,
    FOREIGN KEY (id_pais) REFERENCES pais(id_pais) ON DELETE CASCADE
);


-- Tabela Município: Armazena os municípios cadastrados e a qual UF ele pertence 
CREATE TABLE municipio (
    id_municipio SERIAL PRIMARY KEY,
    nome_municipio TEXT NOT NULL,
    id_uf INT NOT NULL,
    FOREIGN KEY (id_uf) REFERENCES uf(id_uf) ON DELETE CASCADE
);


-- Tabela Tipo: Armazena informações sobre a tipologia do evento 
CREATE TABLE tipo (
    id_tipo SERIAL PRIMARY KEY,
    descricao TEXT,
    categoria TEXT[], 
    material_dominante TEXT,
    velocidade REAL 
);


-- Tabela Evento: Armazena os dados gerais do evento, o município em que ocorreu e sua tipologia   
CREATE TABLE evento (
    id_evento SERIAL PRIMARY KEY,
    data_evento TIMESTAMP NOT NULL,
    coordenadas_x DECIMAL(10, 6) NOT NULL,  --longitude 
    coordenadas_y DECIMAL(10, 6) NOT NULL, --latitude
    id_municipio INT NOT NULL,
    id_tipo INT NOT NULL,
    esta_validado BOOLEAN NOT NULL,
    FOREIGN KEY (id_municipio) REFERENCES municipio(id_municipio) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo) REFERENCES tipo(id_tipo) ON DELETE CASCADE
);



-- Tabela Mídia: Armazena mídias e o evento relacinado a esta mídia  
CREATE TABLE midia (
    id_midia SERIAL PRIMARY KEY,
    tipo_midia TEXT,
    fonte_midia TEXT,
    data_coleta DATE,
    url_midia TEXT NOT NULL UNIQUE,
    id_evento INT NOT NULL,
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE
);


-- Tabela Impactos: Armazena o evento ao qual esta associado
CREATE TABLE impactos (
    id_impacto SERIAL PRIMARY KEY,
    id_evento INT NOT NULL,
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE
);


-- Tabela Impactos_Sociais: Armazena dados sobre os impactos sociais de um evento 
CREATE TABLE impactos_sociais (
    id_is SERIAL PRIMARY KEY,
    tempo_recuperacao INT,
    servicos_essenciais_afetados TEXT[],
    n_familias_afetadas INT,
    n_desalojados INT,
    n_desaparecidos INT,
    n_mortos INT,
    n_feridos INT,
    n_desabrigados INT,
    id_impacto INT NOT NULL,
    FOREIGN KEY (id_impacto) REFERENCES impactos(id_impacto) ON DELETE CASCADE
);


-- Tabela Impactos_Economicos: Armazena dados sobre os impactos econômicos de um evento 
CREATE TABLE impactos_economicos (
    id_ie SERIAL PRIMARY KEY,
    seguro_cobertura BOOLEAN,
    custo_recuperacao DECIMAL(15, 2),
    dano_patrimonio_privado DECIMAL(15, 2),
    dano_patrimonio_publico DECIMAL(15, 2),
    valor_total_danos_economicos DECIMAL(15, 2),
    interrupcao_economica_duracao INT,
    interrupcao_economica_setores_afetados TEXT[], 
    danos_agricolas_valor_estimado DECIMAL(15, 2),
    danos_agricolas_area_atingida REAL,
    danos_agricolas_percentual_area_atingida REAL,
    danos_agricolas_cultura_atingida TEXT,
    id_impacto INT NOT NULL,
    FOREIGN KEY (id_impacto) REFERENCES impactos(id_impacto) ON DELETE CASCADE
);


-- Tabela Impactos_Ambientais: Armazena dados sobre os impactos ambientais de um evento 
CREATE TABLE impactos_ambientais (
    id_ia SERIAL PRIMARY KEY,
    area_atingida REAL,
    custo_mitigacao DECIMAL(15, 2),
    recursos_naturais_afetados TEXT, 
    danos_biodiversidade TEXT, 
    tipo_impacto TEXT, 
    tempo_recuperacao INT,
    status_recuperacao TEXT,
    id_impacto INT NOT NULL,
    FOREIGN KEY (id_impacto) REFERENCES impactos(id_impacto) ON DELETE CASCADE
);


-- Tabela Fatores_Extrinsecos: Armazena o evento ao qual esta associado
CREATE TABLE fatores_extrinsecos (
    id_fe SERIAL PRIMARY KEY,
    id_evento INT NOT NULL,
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE
);


-- Tabela Clima: Armazena informações sobre o clima de um evento
CREATE TABLE clima (
    id_clima SERIAL PRIMARY KEY,
    vento REAL,
    precipitacao_evento REAL, 
    precipitacao_5d REAL,
    precipitacao_10d REAL,
    precipitacao_mensal REAL,
    temperatura REAL,
    etp REAL,
    pressao_atm REAL, 
    id_fe INT NOT NULL,
    FOREIGN KEY (id_fe) REFERENCES fatores_extrinsecos(id_fe) ON DELETE CASCADE
);



-- Tabela Fatores_Antropicos
CREATE TABLE fatores_antropicos (
    id_fatores_antropicos SERIAL PRIMARY KEY,
    escavacao BOOLEAN,
    mineracao BOOLEAN,
    sobrecarga BOOLEAN,
    tipo_uso TEXT,
    id_fe INT NOT NULL,
    FOREIGN KEY (id_fe) REFERENCES fatores_extrinsecos(id_fe) ON DELETE CASCADE
);


-- Tabela Fatores_Intrinsecos
CREATE TABLE fatores_intrinsecos (
    id_fi SERIAL PRIMARY KEY,
    id_evento INT NOT NULL,
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE
);


-- Tabela Geologia
CREATE TABLE geologia (
    id_geologia SERIAL PRIMARY KEY,
    tipo_rocha TEXT,
    composicao TEXT, 
    estrutura TEXT, 
    idade INT,
    tectonismo BOOLEAN, 
    id_fi INT NOT NULL,
    FOREIGN KEY (id_fi) REFERENCES fatores_intrinsecos(id_fi) ON DELETE CASCADE
);


-- Tabela Geomorfologia
CREATE TABLE geomorfologia (
    id_geomorfologia SERIAL PRIMARY KEY,
    declividade TEXT,
    altitude INT,
    orientacao TEXT,
    curvatura_horizontal TEXT,
    curvatura_vertical TEXT,
    forma_terreno TEXT,
    id_fi INT NOT NULL,
    FOREIGN KEY (id_fi) REFERENCES fatores_intrinsecos(id_fi) ON DELETE CASCADE
);


CREATE TABLE pedologia (
    id_pedologia SERIAL PRIMARY KEY, 
    pedologia_url TEXT,
    classe_solo TEXT,
    profundidade INT,
    textura TEXT, 
    porosidade INT,
    uv_cc REAL, 
    uv_evento REAL, 
    cad REAL,
    k REAL,
    id_fi INT NOT NULL,
    FOREIGN KEY (id_fi) REFERENCES fatores_intrinsecos(id_fi) ON DELETE CASCADE
);


-- TABELA DOS USUARIOS

--tabela users
CREATE TABLE users (
  id_user SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL
);