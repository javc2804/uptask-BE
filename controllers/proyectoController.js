import mongoose from "mongoose"
import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"

const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        '$or': [
            { 'colaboradores': { $in: req.usuario } },
            { 'creador': { $in: req.usuario } }
        ]
    })
        .select('-tareas')
    res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        return res.send(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params

    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Proyecto no existe')
        return res.status(404).json({ msg: error.message })
    }

    const proyecto = await Proyecto.findById(id)
        //TODO : populate a un populate solo informativo.
        .populate({ path: 'tareas', populate: { path: 'completado', select:"nombre" } })
        .populate('colaboradores', " nombre email")

    if (!proyecto) {
        const error = new Error("No encontrado")
        return res.status(404).json({ msg: error })
    }

    if  (
            proyecto.creador.toString() !== req.usuario._id.toString() &&
            !proyecto.colaboradores.some(
                (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
            )
        ){
            const error = new Error("Accion no válida")
            return res.status(401).json({ msg: error.message })
        }

    // Obtener las taras del proyecto

    // const tareas = await Tarea.find()
    // .where('proyecto').equals(proyecto._id)


    res.json(proyecto)

}

const editarProyecto = async (req, res) => {
    const { id } = req.params

    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Proyecto no existe')
        return res.status(404).json({ msg: error.message })
    }

    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        return res.status(404).json({ msg: "No encontrado" })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        return res.status(401).json({ msg: "Accion no válida" })
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        res.status(500).json({ msg: "Error interno del servidor" }) // Manejo de errores
    }

    // res.json(proyecto)
}

const eliminarProyectos = async (req, res) => {
    const { id } = req.params

    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Proyecto no existe')
        return res.status(404).json({ msg: error.message })
    }

    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        return res.status(404).json({ msg: "No encontrado" })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        return res.status(401).json({ msg: "Accion no válida" })
    }

    try {
        await proyecto.deleteOne()
        res.json({ msg: 'Proyecto eliminado' })
    } catch (error) {
        console.log(error)
    }
}

const buscarColaborador = async (req, res) => {
    const { email } = req.body
    const usuario = await Usuario.findOne({ email })
        .select('-password -createdAt -confirmado -token -updatedAt -__v')
    if (!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    res.json(usuario)
}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({ msg: error.message })
    }

    const { email } = req.body
    const usuario = await Usuario.findOne({ email })
        .select('-password -createdAt -confirmado -token -updatedAt -__v')

    if (!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    // El colaborador no es el admin del proyecto
    if (proyecto.creador.toString() == usuario._id.toString()) {
        const error = new Error('El creador del proyecto no puede ser colaborador')
        return res.status(404).json({ msg: error.message })
    }

    // Revisar que no este ya agregado al proyecto

    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya pertenece al proyecto')
        return res.status(404).json({ msg: error.message })
    }

    // Esta bien se puede agregar

    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({ msg: 'Colaborador agregado correctamente' })

}

const EliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({ msg: error.message })
    }


    // Revisar que no este ya agregado al proyecto

    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({ msg: 'Colaborador eliminado correctamente' })
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyectos,
    agregarColaborador,
    EliminarColaborador,
    buscarColaborador
}