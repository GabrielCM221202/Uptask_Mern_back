import express from "express";
import dotenv from "dotenv";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectosRoutes from "./routes/proyectosRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";
import cors from "cors";

//Crear el servidor
const app = express();
//habilitar JSON
app.use(express.json());
//Leer las variables de entorno
dotenv.config();
//Conectar la base de datos
conectarDB();
//Configurar cors

const whiteList = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.includes(origin)) {
      //Tiene acceso a la API
      callback(null, true);
    } else {
      //No tiene permiso
      callback(new Error("Error de cors"));
    }
  },
};

app.use(cors(corsOptions));

//Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectosRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
  console.log(`Servidor montado en el puerto ${PORT}`);
});

//Socket.io

import { Server } from "socket.io";

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Conectado a socket.io ");

  //Definir los eventos de socket io
  socket.on("abrir proyecto", (proyecto) => {
    socket.join(proyecto);
  });

  socket.on("nueva tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", tarea => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada" , tarea)
  })

  socket.on("actualizar tarea" , tarea =>{
    const  proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("tarea actualizada" , tarea)
  })

  socket.on("cambiar estado" , tarea => {
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit("estado cambiado" , tarea)
  })
});
