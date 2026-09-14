# AI Conversational Bot Backend

## 1. De que se trata el proyecto

Este proyecto es un backend en Node.js, Express y TypeScript para un bot conversacional con integracion de OpenAI.

El servidor expone endpoints HTTP para validar que la API esta funcionando y para enviar mensajes a OpenAI. Tambien levanta un servidor de Socket.IO para recibir mensajes en tiempo real y responder usando un agente de OpenAI conectado a un servidor MCP de ordenes.

Funcionalidades principales:

- Servidor Express en el puerto configurado por `PORT` o, por defecto, `3000`.
- Endpoint `GET /` para verificar que el servidor esta activo.
- Endpoint `GET /api/hello` para una respuesta de prueba.
- Endpoint `POST /api/message` para enviar un mensaje y obtener una respuesta generada por OpenAI.
- Servidor Socket.IO en el puerto `3001`.
- Conexion a un servidor MCP de ordenes en `http://localhost:3002/mcp`.

## 2. Como se ejecuta

Primero instala la imagen de Redis en Docker:

```bash
npm run redis-start
```

Luego instala las dependencias:

```bash
npm install
```

Crea un archivo `.env` tomando como referencia `.env.example`:

```env
PORT=3000
OPENAI_API_KEY=tu_api_key_de_openai
OPENAI_MODEL=gpt-4.1-mini
```

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

Para ejecutarlo sin modo watch:

```bash
npm start
```

Para compilar TypeScript:

```bash
npm run build
```

Para ejecutar la version compilada:

```bash
npm run start:compiled
```

## 3. Que hay que tener en cuenta para ejecutarlo

- Este proyecto depende de que un MCP este funcionando. [Link para el proyecto](https://github.com/pbassilbaqapps/AI-Conversational-bot-MCP).
- Se recomienda instalar Docker Desktop para el manejo de la imagen de Redis.
- Se recomienda usar la version de Node indicada en `.nvmrc`: `v24.20.0`.
- El archivo `.env` debe existir y debe incluir `OPENAI_API_KEY`; si no esta definida, la aplicacion falla al iniciar.
- `OPENAI_MODEL` es opcional. Si no se define, se usa `gpt-4.1-mini`.

### Como usar el Socket

- Socket.IO siempre se levanta en el puerto `3001`.
- El cliente debe conectarse a `http://localhost:3001`.
- Para enviar mensajes al bot, se debe emitir el evento `message_in`.
- Para recibir respuestas, se debe escuchar el evento `messages_updated`.
- Para que las funciones de agente con MCP trabajen correctamente, debe estar disponible un servidor MCP de ordenes en `http://localhost:3002/mcp`.

Ejemplo de uso desde un cliente Socket.IO:

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

socket.emit("message_in", "Hola, quiero consultar una orden");

socket.on("messages_updated", (message) => {
  console.log(message);
});
```

### Como usar el API Rest

- `PORT` es opcional. Si no se define, Express se ejecuta en `http://localhost:3000`.
- El endpoint `GET /` permite verificar que el servidor esta activo.
- El endpoint `GET /api/hello` devuelve una respuesta de prueba.
- El endpoint `POST /api/message` espera un body JSON con la propiedad `message`.

Ejemplo de body para `POST /api/message`:

```json
{
  "message": "Hola, quiero consultar una orden",
  "sessionId": "1234"
}
```
