const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/jwt');

// res = express.response : se utiliza para poder tener el tipado de los metodos que se pueden utilizar
// Si se retorna mas de un response este marcara un error
const crearUsuario = async (req, res = response) => {
	const { email, password } = req.body;

	try {
		// Busca en la BD si existe el email
		let usuario = await Usuario.findOne({ email });

		// Si existe un usuario con el email este marca un error e impide su creación
		if (usuario) {
			return res.status(400).json({
				ok: false,
				msg: 'Un usuario existe con ese correo',
			});
		}

		usuario = new Usuario(req.body);

		// Encriptar contraseña
		const salt = bcrypt.genSaltSync();
		usuario.password = bcrypt.hashSync(password, salt);

		await usuario.save();

		// Generar JWT
		const token = await generarJWT(usuario.id, usuario.name);

		res.status(201).json({
			ok: true,
			uid: usuario.id,
			name: usuario.name,
			token,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			ok: false,
			msg: 'Por favor hable con el administrador',
		});
	}
};

const loginUsuario = async (req, res = response) => {
	const { email, password } = req.body;

	try {
		// Busca en la BD si existe el email
		let usuario = await Usuario.findOne({ email });

		// Si existe un usuario con el email este marca un error e impide su creación
		if (!usuario) {
			return res.status(400).json({
				ok: false,
				msg: 'El usuario o contraseña no son correctos',
			});
		}

		// Confirmar los passwords
		const validPassword = bcrypt.compareSync(password, usuario.password);

		if (!validPassword) {
			return res.status(400).json({
				ok: false,
				msg: 'Password incorrecto',
			});
		}

		// Generar JWT
		const token = await generarJWT(usuario.id, usuario.name);

		res.json({
			ok: true,
			uid: usuario.id,
			name: usuario.name,
			token,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			ok: false,
			msg: 'Por favor hable con el administrador',
		});
	}
};

const revalidarToken = async (req, res = response) => {
	const uid = req.uid;
	const name = req.name;

	// Generar JWT
	const token = await generarJWT(uid, name);

	res.json({
        ok: true,
        uid, name,
        token 
	});
};

module.exports = { crearUsuario, loginUsuario, revalidarToken };
