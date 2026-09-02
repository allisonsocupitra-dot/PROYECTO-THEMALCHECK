CREATE DATABASE thermalcheck;
USE thermalcheck;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100),
    correo_usuario VARCHAR(100),
    contraseña_usuario VARCHAR(255),
    id_rol INT
);

CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    tipo_rol VARCHAR(50)
);

CREATE TABLE informe (
    id_informe INT AUTO_INCREMENT PRIMARY KEY,
    fecha_generacion DATE DEFAULT (CURRENT_DATE),
    nivel_riesgo VARCHAR(400),
    observaciones TEXT,
    estado VARCHAR(10),
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_pdf VARCHAR(500) NOT NULL,
    id_usuario INT NOT NULL
);

CREATE TABLE imagen_termografica (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    nombre_archivo VARCHAR(300) NOT NULL,
    fecha_modificacion DATETIME,
    ancho INT,
    alto INT,
    formato VARCHAR(10),
    modelo_camara VARCHAR(100),
    numero_serie VARCHAR(100),
    distancia_focal DECIMAL(5,2),
    numero_f DECIMAL(4,2),
    latitud DECIMAL(10,6),
    longitud DECIMAL(10,6),
    distancia_m DECIMAL(6,2),
    humedad DECIMAL(5,2),
    emisividad DECIMAL(4,2),
    temp_reflejada DECIMAL(6,2),
    temp_max DECIMAL(6,2),
    temp_min DECIMAL(6,2),
    id_usuario INT,
    id_informe INT
);

CREATE TABLE punto_medicion (
    id_punto INT AUTO_INCREMENT PRIMARY KEY,
    etiqueta VARCHAR(20),
    valor_temp DECIMAL(6,2),
    id_imagen INT
);


ALTER TABLE usuario
    ADD CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol);

ALTER TABLE informe
    ADD CONSTRAINT fk_informe_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE imagen_termografica
    ADD CONSTRAINT fk_imagen_informe
    FOREIGN KEY (id_informe) REFERENCES informe(id_informe);

ALTER TABLE imagen_termografica
    ADD CONSTRAINT fk_imagen_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

ALTER TABLE punto_medicion
    ADD CONSTRAINT fk_punto_imagen
    FOREIGN KEY (id_imagen) REFERENCES imagen_termografica(id_imagen);
    
INSERT INTO rol (tipo_rol) VALUES ('Administrador'), ('Tecnico');

SELECT * FROM usuario;

SELECT * FROM punto_medicion


USE thermalcheck;

ALTER TABLE punto_medicion
ADD COLUMN tipo ENUM('punto','region') NOT NULL DEFAULT 'punto',
ADD COLUMN x INT NULL,
ADD COLUMN y INT NULL,
ADD COLUMN x1 INT NULL,
ADD COLUMN y1 INT NULL,
ADD COLUMN x2 INT NULL,
ADD COLUMN y2 INT NULL,
ADD COLUMN valor_min DECIMAL(6,2) NULL,
ADD COLUMN valor_avg DECIMAL(6,2) NULL,
ADD COLUMN valor_max DECIMAL(6,2) NULL;

ALTER TABLE punto_medicion
MODIFY COLUMN valor_temp DECIMAL(6,2) NULL;

ALTER TABLE imagen_termografica
    ADD COLUMN ruta_archivo VARCHAR(500) NULL AFTER nombre_archivo;
    
ALTER TABLE punto_medicion
  ADD COLUMN pos_min_x INT NULL,
  ADD COLUMN pos_min_y INT NULL,
  ADD COLUMN pos_max_x INT NULL,
  ADD COLUMN pos_max_y INT NULL;
 