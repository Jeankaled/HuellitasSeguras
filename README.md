#  Huellitas Seguras - Plataforma SaaS Multi-Tenant

## 1. Descripción del proyecto

"Huellita Segura" es una plataforma SaaS (Software como Servicio) con arquitectura Multi-Tenant orientada a fundaciones, refugios de animales y municipalidades en Chile. La solución resuelve la gestión administrativa informal y la falta de trazabilidad en las adopciones, actuando como el puente tecnológico que hace viable la Ley 21.020 (Ley Cholito) y la Ley 19.799. Centraliza el historial clínico de las mascotas y formaliza el proceso de adopción mediante la generación automática de contratos digitales con validación de identidad (KYC ligero) y Firma Electrónica Simple (FES), entregando a las organizaciones respaldo legal ante posibles casos de maltrato o abandono.
---
## 2. Tecnologías utilizadas
- **Lenguajes:** JavaScript, SQL.   

- **Frameworks / Librerías:** React, Vite, TailwindCSS (Frontend) / Node.js, Express, Bcrypt, JWT, Multer (Backend). 

- **Base de datos**: PostgreSQL 15.   

- **Cloud / Infraestructura:** Docker, Docker Compose (para orquestación local) y AWS (para despliegue en producción)

---
##  3. Prerrequisitos del Sistema

Para poder levantar este proyecto en tu computadora local, es **estrictamente necesario** que tengas instalados los siguientes programas:

1. **[Node.js](https://nodejs.org/es/):** El motor principal para ejecutar el Backend y el Frontend. (Asegúrate de instalar la versión LTS).
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/):** Necesario para levantar la base de datos PostgreSQL de forma automatizada sin ensuciar tu sistema operativo. **Debes abrir este programa y esperar a que esté en verde ("Running") antes de seguir.**
3. **[Git](https://git-scm.com/):** Para clonar el repositorio.
4. **Visual Studio Code:** Recomendado como editor de código.

---

##  4. Guía de Instalación y Ejecución Paso a Paso

### Paso 1: Descargar el proyecto
Abre tu terminal, posiciónate donde deseas guardar el proyecto y ejecuta:

```bash
git clone <URL_DE_ESTE_REPOSITORIO>
cd <NOMBRE_DE_LA_CARPETA_CREADA>

```

## Paso 2: Levantar la Base de Datos (Docker)
Nuestro sistema utiliza un contenedor preconfigurado que automatiza la creación de las tablas (Multi-Tenant).


 En tu terminal, ingresa a la carpeta de la base de datos:
```bash

cd "fase2/Evidencias_De_Sistema/Base_Datos"
```


# Ejecuta el siguiente comando para construir y encender la base de datos en segundo plano:
```bash
docker-compose up -d
```
(Nota: Docker leerá automáticamente el archivo init.sql y creará toda la estructura relacional).

## Paso 3: Configurar y Encender el Backend (Node.js)
Abre una nueva pestaña de terminal y navega a la carpeta del backend:
```bash
cd "fase2/Evidencias_De_Sistema/Aplicacion/Backend" 
```
# Configuración vital: Crea un archivo llamado .env en esta carpeta y pega exactamente las siguientes variables de entorno(*ojo*: Solo si no se clona la caprteta .env):
```bash
DB_USER=admin_huellita
DB_PASSWORD=password123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=huellita_segura_db
PORT=3000
JWT_SECRET=super_secreto_huellitas_2026
```
# Instala todas las dependencias del servidor (Express, Bcrypt, JWT, etc.):
```bash
npm install
```
# Sembrar datos de prueba: Para no iniciar con un sistema vacío, ejecuta nuestro script automático que creará refugios, animales y usuarios de prueba:
```bash
node seeder.js
```
# Enciende el servidor backend:
```bash
npm run dev
```
(Verás un mensaje indicando: "Servidor ejecutándose en http://localhost:3000" y "Conexión exitosa a PostgreSQL").

## Paso 4: Configurar y Encender el Frontend (React/Vite)
Finalmente, levantaremos la interfaz visual para interactuar con el sistema.

Abre una tercera pestaña de terminal (no cierres la del backend) y navega a la carpeta del frontend:
```bash
cd "fase2/Evidencias_De_Sistema/Aplicacion/frontend" 
```
# Configuración vital: Crea un archivo llamado .env en esta carpeta y pega esta variable para enlazarlo con el backend(*ojo*: Solo si no se clona la caprteta .env):
```bash
VITE_API_URL=http://localhost:3000
```
# Instala las dependencias de la interfaz visual (Vite, Tailwind, React Router, etc.):
```bash
npm install
```
# Enciende el servidor visual:
```bash
npm run dev
```
(La terminal te dará una ruta local, generalmente http://localhost:5173. Ábrela en tu navegador).

## 4. Credenciales de Prueba (Testing)

Si ejecutaste el comando node seeder.js en el Paso 3, tu base de datos ya está poblada. Ve al navegador (al enlace del Frontend) e inicia sesión con cualquiera de estos dos perfiles Multi-Tenant:
##
Refugio 1 (Patitas):

Usuario: admin@patitas.cl

Clave: admin123
##
Refugio 2 (Pequeñas Huellas):

Usuario: admin@pequenas.cl

Clave: admin123

---

## 5. Integrantes del equipo y roles
| Integrante | Rol |
|---|---|
| Ávila, Jean  | Backend Developer / Product Owner |
| Quezada, Bárbara |	Frontend Developer / Scrum Master | 

---
## 6. Metodología de trabajo

Utilizamos Metodología Ágil basada en el marco de trabajo Scrum, adaptado para un equipo de dos personas. Organizamos el desarrollo en iteraciones cortas (Sprints de 2 a 3 semanas) para asegurar entregas funcionales incrementales. Para la gestión del Product Backlog, tareas (En proceso, En rRevision, Entregado) y seguimiento del proyecto utilizamos el tablero Kanban de Trello. El control de versiones se gestiona con Git Flow en GitHub, utilizando ramas por característica (feature/) y protegiendo las ramas main y develop mediante Pull Requests.

---
## 7. Arquitectura de la solución

El sistema opera bajo un modelo SaaS Multi-Tenant (multi-inquilino) que asegura la separación, integridad y privacidad de la información visual y de bases de datos entre las distintas organizaciones. Se divide en un Backend (API REST en Node.js) que centraliza la lógica de negocio, validaciones y generación de contratos, y un Frontend (SPA en React) enfocado en ser responsivo (Mobile-First). Ambas capas se comunican por JSON bajo protección de tokens JWT, mientras la persistencia relacional ocurre en un contenedor Docker con PostgreSQL, aislando la información de cada refugio mediante llaves foráneas (refugio_id).

---
## Sección de innovación (documento de cierre)

- **¿Qué problema resuelve?** La informalidad administrativa y la falta de trazabilidad en las adopciones de animales en Chile. Las fundaciones operan con papel o Excel, lo que genera una desconexión legal con el Registro Nacional de Mascotas y pérdida del rastro de adoptantes, dificultando que las normativas de tenencia responsable se cumplan.
- **¿Qué hace diferente a la solución?** No es un simple software de gestión veterinaria, sino una plataforma con enfoque probatorio y legal que incorpora el marco regulatorio nacional. Su arquitectura Multi-Tenant permite que organizaciones sin recursos alojen sus datos de forma segregada y segura, aplicando Firma Electrónica Simple (FES) apoyada en sellos de tiempo y códigos de un solo uso (OTP).
- **¿Qué valor agrega?** Empodera a las organizaciones al estandarizar los requisitos de adopción (validación algorítmica de RUT, doble factor de contacto) y automatiza un "Botón Rojo": un módulo que genera expedientes legales completos e inmutables listos para que los refugios ejerzan su facultad de querellarse formalmente ante casos de abandono o maltrato animal.

---
