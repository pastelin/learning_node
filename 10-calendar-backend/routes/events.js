/*
    Event Routes
    /api/events

*/

const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { getEventos, crearEvento, actualizarEvento, eliminarEvento } = require('../controllers/events');
const { isDate } = require('../helpers/isDate');

const router = Router();

// Agrega validacion de JWT a cualquier peticion que se realice
router.use(validarJWT);


router.get('/', getEventos);

router.post(
    '/',
    [
        check('title', 'El titulo es obligatorio').not().isEmpty(),
        check('start', 'Fecha de inicio es obligatoria').custom(isDate),
        check('end', 'Fecha de finalización es obligatoria').custom(isDate),
        validarCampos
    ],
    crearEvento);

router.put('/:id', actualizarEvento);
router.delete('/:id', eliminarEvento);

module.exports = router;
