var isAuthenticated = require('./middleware');
var express = require('express');
var router = express.Router();


const bcrypt = require('bcrypt');
const Product = require('../models/Product');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Nodepop' });
});

router.get('/productos', isAuthenticated, async function(req, res, next) {

  try {
    
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
    
  } catch (error) {
    next(error);
  }
});


router.get('/productos/new', isAuthenticated, function(req, res, next) {
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
    tags: tags,
    owner: req.session.user
  });

  await product.save();

  res.redirect('/productos');
});

router.post('/productos/:id/delete', isAuthenticated, async function(req, res, next) {
  try {
    const result = await Product.deleteOne({ 
      _id: req.params.id,
      owner: req.session.user
    });

    if (result.deletedCount === 0) {
      return res.status(404).send('Producto no encontrado o no tiene permiso para eliminarlo');
    }

    res.redirect('/productos');

  } catch (error) {
    next(error);
  }
});

const User = require('../models/user');


router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});


router.post('/login', async function(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.send('El mail o la contraseña no son correctos');
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.send('El mail o la contraseña no son correctos');
    }

    req.session.user = user.email;
    res.redirect('/productos');

  } catch (error) {
    next(error);
  }
  });
  

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/register', async function(req, res, next) {

  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.send('El email ya está registrado');
    
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      password: hashedPassword
    });


  await user.save();

  req.session.user = user.email;
  res.redirect('/productos');
  } catch (error) {
    next(error);
  }
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    res.redirect('/login');
  });
});


module.exports = router;
