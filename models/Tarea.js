import moongose from "mongoose";

const tareaSchema = moongose.Schema(
  {
    nombre: {
      type: String,
      trim: true,
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
      required: true,
    },
    estado: {
      type: Boolean,
      default: false,
    },
    fechaEntrega: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    prioridad: {
      type: String,
      required: true,
      enum: ["Baja", "Media", "Alta"],
    },
    proyecto: {
      type: moongose.Schema.Types.ObjectId,
      ref: "Proyecto",
    },
    completado: {
      type: moongose.Schema.Types.ObjectId,
      ref: "Usuario"

    }
  },
  {
    timestamps: true,
  }
);

const Tarea = moongose.model("Tarea" , tareaSchema)

export default Tarea;
