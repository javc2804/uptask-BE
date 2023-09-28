import Proyecto from '../models/Proyecto.js'
import Tarea from '../models/Tarea.js'
const agregarTarea = async (req, res) => {
    const { proyecto } = req.body
    const existeproyecto = await Proyecto.findById(proyecto)
    if (!existeproyecto) {
        const error = new Error('Proyecto no existe')
        return res.status(404).json({
            msg: error.message,
        })
    }

    if (existeproyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los permisos para anadir tareas")
        return res.status(401).json({
            msg: error.message,
        })
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        // Almacenar el id en el proyecto
        existeproyecto.tareas.push(tareaAlmacenada._id)
        await existeproyecto.save()
        return res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }

}
const obtenerTarea = async (req, res) => {
    const { id } = req.params
    const tarea = await Tarea.findById(id)
        .populate('proyecto')

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({
            msg: error.message,
        })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion no valida')
        return res.status(403).json({
            msg: error.message,
        })
    }

    res.json(tarea)

}
const actualizarTarea = async (req, res) => {
    const { id } = req.params
    const tarea = await Tarea.findById(id)
        .populate('proyecto')

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({
            msg: error.message,
        })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion no valida')
        return res.status(403).json({
            msg: error.message,
        })
    }

    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.description = req.body.description || tarea.description
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaAlmacenada = await Tarea.updateOne(req.body)
        return res.json(tarea)
    } catch (error) {

    }

}
const eliminarTarea = async (req, res) => {
    const { id } = req.params
    const tarea = await Tarea.findById(id)
        .populate('proyecto')

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({
            msg: error.message,
        })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion no valida')
        return res.status(403).json({
            msg: error.message,
        })
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        await Promise.all([
            await proyecto.save(),
            await tarea.deleteOne()
        ])
        res.json({ msg: 'La tarea se eliminó' })
    } catch (error) {

    }
}
const cambiarEstado = async (req, res) => {
    const { id } = req.params
    const tarea = await Tarea.findById(id)
        .populate('proyecto')        

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({
            msg: error.message,
        })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
        !tarea.proyecto.colaboradores.some(
            (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
        )
    ) {
        const error = new Error('Accion no valida')
        return res.status(403).json({
            msg: error.message,
        })
    }

    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    try {
        tarea.save()
        const tareaAlmacenada = await Tarea.findById(id)
        .populate('proyecto')
        .populate('completado')

        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error);
    }
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}