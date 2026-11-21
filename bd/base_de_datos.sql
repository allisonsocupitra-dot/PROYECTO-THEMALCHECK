CREATE DATABASE thermalcheck;
USE thermalcheck;

CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    tipo_rol VARCHAR(50)
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100),
    correo_usuario VARCHAR(100),
    contraseña_usuario VARCHAR(255),
    id_rol INT
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
    ruta_archivo VARCHAR(500),
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
    id_informe INT,
    observaciones TEXT NULL
);

CREATE TABLE punto_medicion (
    id_punto INT AUTO_INCREMENT PRIMARY KEY,
    etiqueta VARCHAR(20),
    valor_temp DECIMAL(6,2) NULL,
    id_imagen INT,
    tipo ENUM('punto','region') NOT NULL DEFAULT 'punto',
    x INT NULL,
    y INT NULL,
    x1 INT NULL,
    y1 INT NULL,
    x2 INT NULL,
    y2 INT NULL,
    valor_min DECIMAL(6,2) NULL,
    valor_avg DECIMAL(6,2) NULL,
    valor_max DECIMAL(6,2) NULL,
    pos_min_x INT NULL,
    pos_min_y INT NULL,
    pos_max_x INT NULL,
    pos_max_y INT NULL,
    color VARCHAR(20) NULL
);

ALTER TABLE usuario
    ADD CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol);

ALTER TABLE informe
    ADD CONSTRAINT fk_informe_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);
    
INSERT INTO rol (tipo_rol) VALUES
  ('Tecnico'),
  ('Administrador');