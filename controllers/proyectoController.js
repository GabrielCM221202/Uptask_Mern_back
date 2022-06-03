import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";
import Tarea from "../models/Tarea.js";

const obtenerProyectos = async (req, res) => {
  const { usuario } = req;

  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  }).select("-tareas");
  res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
  const { usuario } = req;
  const proyecto = new Proyecto(req.body);
  proyecto.creador = usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.error(error);
  }
};

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;

  try {
    const proyecto = await Proyecto.findById(id)
      .populate({
        path: "tareas",
        populate: { path: "completado", select: "nombre" },
      })
      .populate("colaboradores", "nombre email");
    const creador = proyecto.creador.toString();
    const idUsuario = req.usuario._id.toString();

    if (
      creador !== idUsuario &&
      !proyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      const error = new Error("Accion no valida");
      return res.status(401).json({ msj: error.message });
    }
    //const tareas = await Tarea.find().where("proyecto").equals(proyecto._id);

    res.json(proyecto);
  } catch (error) {
    error = new Error("Error al obtener el proyecto");
    return res.status(404).json({ msj: error.message });
  }
};

const editarProyecto = async (req, res) => {
  const { id } = req.params;

  try {
    const proyecto = await Proyecto.findById(id);
    const creador = proyecto.creador.toString();
    const idUsuario = req.usuario._id.toString();

    if (creador !== idUsuario) {
      const error = new Error("Accion no valida");
      return res.status(401).json({ msj: error.message });
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    const proyectoAlmacenado = await proyecto.save();

    res.json(proyectoAlmacenado);
  } catch (error) {
    error = new Error("Error al obtener el proyecto");
    return res.status(404).json({ msj: error.message });
  }
};

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;

  try {
    const proyecto = await Proyecto.findById(id);
    const creador = proyecto.creador.toString();
    const idUsuario = req.usuario._id.toString();

    if (creador !== idUsuario) {
      const error = new Error("Accion no valida");
      return res.status(401).json({ msj: error.message });
    }

    await Proyecto.findByIdAndDelete(id);

    res.json({ msj: "Proyecto eliminado" });
  } catch (error) {
    error = new Error("Error al obtener el proyecto");
    return res.status(404).json({ msj: error.message });
  }
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;

  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({
      msj: error.message,
    });
  }

  res.json(usuario);
};

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);
  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msj: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(403).json({ msj: error.message });
  }

  const { email } = req.body;

  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({
      msj: error.message,
    });
  }
  //Ver que el colaborador no es el admin del proyecto

  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("El creador de proyecto no puede ser colaborador");
    return res.status(404).json({
      msj: error.message,
    });
  }

  //Revisar que el colaborador no este ya agregado al proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("El usuario ya esta agregado en el proyecto");
    return res.status(404).json({
      msj: error.message,
    });
  }

  //Una vez validado, se puede agregar

  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msj: "Colaborador Agregado correctamente" });
};

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);
  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msj: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(403).json({ msj: error.message });
  }

  //Una vez validado se puede eliminar
  proyecto.colaboradores.pull(req.body.id);

  await proyecto.save();
  res.json({ msj: "Colaborador Eliminado correctamente" });
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador,
};
