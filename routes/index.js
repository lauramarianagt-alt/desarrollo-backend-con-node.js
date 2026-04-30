var isAuthenticated = require('./middleware');
var express = require('express');
var router = express.Router();



const Product = require('../models/Product');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Nodepop' });
});

router.get('/productos', isAuthenticated, async function(req, res, next) {
  
  const filter = {
    owner: req.session.user
  };
  
  if (req.query.name) {
    filter.name = new RegExp('^' + req.query.name, 'i');
  }

  if (req.query.tag) {
    filter.tags = req.query.tag;
  }

  if (req.query.min || req.query.max) {
    filter.price = {};

    if (req.query.min) filter.price.$gte = Number(req.query.min);
    
    if (req.query.max) filter.price.$lte = Number(req.query.max);
    
  }

  const skip = Number(req.query.skip) || 0;
  const limit = Number(req.query.limit) || 10;
  const sort = req.query.sort || 'name';

  const products = await Product.find(filter).skip(skip).limit(limit).sort(sort);

  
  res.render('products', { 
    products 
  });
});


router.get('/productos/new', function(req, res, next) {
  res.render('new-product');
});

router.post('/productos', isAuthenticated, async function(req, res, next) {

  console.log('Datos recibidos:', req.body);

  const tags = req.body.tags 
    ? req.body.tags.split(',').map(tag => tag.trim())
    : [];

  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    tags: req.body.tags.split(','),
    owner: req.session.user
  });

  await product.save();

  res.redirect('/productos');
});

router.post('/productos/:id/delete', isAuthenticated, async function(req, res, next) {
  const product = await Product.findById(req.params.id);

  console.log('OWNER:', product.owner);
  console.log('USER:', req.session.user);

  if (!product) {
    return res.status(404).send('Producto no encontrado');
  }

  const owner = Array.isArray(product.owner) ? product.owner[0] : product.owner;

  if (owner !== req.session.user) {
    return res.status(403).send('No tienes permiso para eliminar este producto');
  }

  await Product.findByIdAndDelete(req.params.id);

  res.redirect('/productos');
});

const User = require('../models/User');


router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});


router.post('/login', async function(req, res, next) {
  console.log('BODY LOGIN:', req.body);

  const user = await User.findOne({ 
    email: req.body.email,
    password: req.body.password
  });

  console.log('USER FOUND:', user);

  if (!user) {
    return res.send('El mail o la contraseña no son correctos');
  }

  req.session.user = user.email;
  res.redirect('/productos');
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/register', async function(req, res, next) {
  const existingUser = await User.findOne({ email: req.body.email });

  if (existingUser) {
    return res.send('El email ya está registrado');
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password
  });

  await user.save();

  req.session.user = user.email;
  res.redirect('/productos');
});


router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    res.redirect('/login');
  });
});


module.exports = router;
