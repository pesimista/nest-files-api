## Definición

Realizar un API Rest para una web de subida y gestión de archivos. Entre los servicios que se tendrán que realizar están:

- Login
- Registro (Con la contraseña encriptada)
- Olvide contraseña con envío de email.
- Subida de archivos (AWS S3)
- Bajada de archivos (AWS S3)
- Gestor de archivos donde puedes: cambiar nombre y obtener enlace de archivo. (AWS S3)
- Integrar un buscador de imagenes online usando una API externa (Unsplash por ejemplo)
- Subir una imagen proveniente de una API externa directo a S3 (Es decir, sin que el usuario tenga que bajar la imagen en su local y luego subirla manualmente)

## Especificaciones

### Para el almacenamiento de los archivos usando AWS S3, te dejamos un info para nuestra Bucket:

Key: ***
Secret: ***
Bucket: ***

### Para base de datos:

El sistema que mejor consideres para el tipo de estructura. (mongoDB fue la eleccion)

## Se valorará el uso de las siguientes tecnologías:

- Arquitectura escalable
- Documentación de servicios con SWAGER.
- Uso de Docker y NestJS
- Pruebas unitarias (Jest)

## Variables de entorno requeridas

```
PORT=
DATABASE_URL=
MAILER_HOST=
MAILER_USER=
MAILER_PASS=
EXPIRATION_MINUTES=
JWT_KEY_SECRET=
TOKEN_NAME=
UNSPLASH_ACCESS_KEY=
UNSPLASH_SECRET_KEY=
```

## Instrucciones de ejecucion

1. copiar los environments requeridos en el archivo `.env` (fueron enviados junto al email)

1. para inicial el contenedor, ejecutar: 
```

docker-compose build
docker-compose up -d

```

1. para detener el contenedor basta con ejecutar

```

docker-compose down

```

1. una forma rapida para comenzar a testear la API es utilizando la coleccion de Postman que esta en el repositorio [api.postman_collection.json](./api.postman_collection.json), es sencillamente importarlos desde la app de Postman y ya tendran accesso a todos los calls


### Nota:
- El rename no funciona del todo, puesto que las credenciales que me facilitaron no permiten eliminar archivos dentro del bucket

Happy Testing!