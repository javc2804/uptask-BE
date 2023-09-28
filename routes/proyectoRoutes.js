import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyectos,
    agregarColaborador,
    EliminarColaborador,
    buscarColaborador
}
    from "../controllers/proyectoController.js"
import checkAuth from "../middleware/checkAuth.js";
import express from 'express'

const router = express.Router();

router.route('/').get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyecto)
router.route('/:id').get(checkAuth, obtenerProyecto).put(checkAuth, editarProyecto).delete(checkAuth, eliminarProyectos)
router.post('/colaboradores', checkAuth, buscarColaborador)
router.post('/colaboradores/:id', checkAuth, agregarColaborador)
router.post('/eliminar-colaboradores/:id', checkAuth, EliminarColaborador)

export default router