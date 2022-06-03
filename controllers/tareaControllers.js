import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;
  try {
    let existeProyecto = await Proyecto.findById(proyecto);
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No tienes los permisos para añadir tareas");
      return res.status(403).json({ msj: error.message });
    }
    const tareaAlmacenada = await Tarea.create(req.body);
    //Almacenar el ID en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    error = new Error("El proyecto no se encontro");
    return res.status(404).json({ msj: error.message });
  }
};
const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  try {
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No tienes los permisos para ver las tareas");
      return res.status(403).json({ msj: error.message });
    }
    res.json(tarea);
  } catch (error) {
    error = new Error("La tarea no se encontro");
    return res.status(404).json({ msj: error.message });
  }
};
const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  try {
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error(
        "No tienes los permisos para actualizar las tareas"
      );
      return res.status(403).json({ msj: error.message });
    }

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    await tarea.save();

    res.json(tarea);
  } catch (error) {
    error = new Error("Tarea no encontrada");
    return res.status(404).json({ msj: error.message });
  }
};
const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  try {
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error(
        "No tienes los permisos para eliminar las tareas"
      );
      return res.status(403).json({ msj: error.message });
    }

    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);

    await Promise.allSettled([
      await proyecto.save(),
      await Tarea.findByIdAndDelete(id),
    ]);

    res.json({ msj: "La tarea se elimino correctamente" });
  } catch (error) {
    error = new Error("Tarea no encontrada");
    return res.status(404).json({ msj: error.message });
  }
};
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  try {
    const tarea = await Tarea.findById(id).populate("proyecto");
    if (
      tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
      !tarea.proyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      const error = new Error("No tienes los permisos para esta acción");
      return res.status(403).json({ msj: error.message });
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id

    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado')

    res.json(tareaAlmacenada);
  } catch (error) {
    error = new Error("Tarea no encontrada");
    return res.status(404).json({ msj: error.message });
  }
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
