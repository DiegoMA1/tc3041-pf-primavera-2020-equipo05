// declarar los modelos
const express = require('express')
var Product = require("../models/product");
var User = require("../models/user");
var productUser = require("../models/productUser");
var Carrito = require("../models/carrito");
var Compra = require("../models/compra");
var newsFeed = require("../models/newsFeed");

var router = express.Router();
var passwordHash = require('password-hash')

/* router.get("/", function (req, res) {
  res.json({
    mensaje: "keep alive",
  });
}); */

router.use(function (req, res, next) {
  next();
}); //funcion habilita el middleware

router.get('/', function(req, res) {
  if (req.session.key) {
    res.status(200).send(req.session.key);
  }
  else {
    res.status(400).send({error: "No session started"})
  }
}) 

router
  .route("/login")
  .post(function (req, res) {
    if (req.body.email && req.body.password) {
      User.findOne({email: req.body.email}, function (error, usuarioDB) {
        if (error) {
          res.status(500).send(error);
          return;
        }
        else if (!usuarioDB) {
          res.status(400).send({ message: "Usuario o password incorrectos" });
          return;
        }

        else if (!passwordHash.verify(req.body.password, usuarioDB.password)) {
          res.status(400).send({ message: "Usuario o password incorrectos" });
          return;
        }
        else {
          req.session.key={_id: usuarioDB._id, email: usuarioDB.email};
          //client.setex(usuarioDB._id,120, usuarioDB.email);
          res.status(200).send({ message: "Login success", key: req.session.key});
          //res.status(200).send({ message: "Login success", idUser: usuarioDB._id});

        }
      });
    }
    else {
      res.status(400).send({error: "missing fields"})
    }
  });

router
  .route("/logout")
  .get(function (req, res) {
    req.session.destroy();
    res.status(200).send({ message: "Logout success"});
    
  });

router
  .route("/productsUsers")
  .post(async function (req, res) {
    console.log(req.body)
    //if (req.body.idUser && req.body.name && req.body.condition && req.body.description && req.body.price && req.body.url) {
      var idProd
      await productUser.aggregate([{ $unwind: '$products' }, { $sort: {'products.idProd': -1}},{$limit: 1}], function (err, idProduct) {
        if (err) {
          res.send(err);
          return;
        }
        else {
          console.log(idProduct[0].products.idProd)
          idProd = parseInt(idProduct[0].products.idProd)+1;
        }
      })

      var producto = {
        idProd: idProd,
        name: req.body.name,
        condition: req.body.condition,
        description: req.body.description,
        quantity: 1, 
        price: parseInt(req.body.price), 
        url: req.body.url,
      }

      productUser.findOneAndUpdate({idUser: req.body.idUser}, {$push: {products: producto}}, async function (error, result) {
        if (error) {
          res.status(404).send({ message: "not found" });
          return;
        }
        if (result == null) {
          var product = new productUser();

          product.idUser = req.body.idUser;
          product.products = producto;
          try {
            await product.save(function (err) {
              if (err) {
                console.log(err);
                if (err.name == "ValidationError")
                  res.status(400).send({ error: err.message });
              }
            });
            res.json({ mensaje: "Producto agregado" });
          } catch (error) {
            res.status(500).send({ error: error });
          }
        }
        else {
          res.json({ mensaje: "Producto agregado" })
        }
      });
      
    //}
    //else {
      //res.status(400).send({error: "missing fields"})
    //}
    
  })
router
  .route("/allProducts/:page")
  .get(async function (req, res) {
    const resPerPage = 3;
    const page = req.params.page;

    await productUser.find({ }).skip((resPerPage * page)-resPerPage).limit(resPerPage).sort({idUser: 1}).exec(async function (err, products) {
      if (err) {
        res.send(err);
      }
      else {
        await productUser.count({}, function (err, count) {
          if (err) {
            res.send(err);
          }
          else {
            res.status(200).send({products, currentPage: parseInt(page), pages: Math.ceil(count / resPerPage)});

          }
        })
      }
      //res.status(200).send(products);
    })
  });

router
  .route("/products/:id_product")
  .get(function (req, res) {
    productUser.aggregate([{ $unwind: '$products' }, { $match: {'products.idProd': parseInt(req.params.id_product)}}], function (error, product) {
      if (error) {
        res.status(404).send({ message: "not found" });
        return;
      }
      if (product == "") {
        res.status(404).send({ product: "not found" });
        return;
      }
      res.status(200).send(product);
    });
  })
  .put(function (req, res) {
    if (req.body.name && req.body.condition && req.body.description && req.body.price && req.body.url) {
      var idProd = parseInt(req.params.id_product);
    
      var producto = {
        idProd: idProd,
        name: req.body.name,
        condition: req.body.condition,
        description: req.body.description,
        quantity: 1, 
        price: parseInt(req.body.price), 
        url: req.body.url,
      }

      productUser.findOneAndUpdate({"products.idProd": idProd}, {$set: {"products.$": producto}}, function (error, result) {
        if (error) {
          res.status(404).send({ message: "not found" });
          return;
        }
        if (result == null) {
          res.status(404).send({ result: "not found" });
          return;
        }
        res.json({ mensaje: "Producto actualizado" })
      });
    }
    else {
      res.status(400).send({error: "missing fields"})
    }
  })
  .delete(function (req, res) {
    var idProd = parseInt(req.params.id_product);

    productUser.updateOne({"products.idProd": idProd}, {$pull: {products: {"idProd": idProd}}}, function (error, result) {
      if (error) {
        console.log(error)
        res.status(404).send({ message: "not found" });
        return;
      }
      if (result == null) {
        res.status(404).send({ result: "not found" });
        return;
      }
      res.json({ mensaje: "Producto eliminado" })
    });
  });

// GET PRODUCTOS DEL USUARIO
router
  .route("/productsUsers/:id_user")
  .get(function (req, res) {
    productUser.aggregate([
      {$match: {'idUser': parseInt(req.params.id_user)} },
      {$lookup: 
        {from: 'users',
        localField: 'idUser',
        foreignField: '_id',
        as: 'user'}
      },
      {$unwind: '$user' },
      {$project: 
        {"idUser":1,
        'products':1,
        'user.name': 1,
        'user.lname': 1,
        'user.profile_pic': 1}
      }
    ],function (error, result) {
      console.log("result" + result)
      if (error) {
        res.status(404).send({ message: "not found" });
        return;
      }
      else if (result == null) {
        res.status(404).send({ result: "not found" });
        return;
      }
      else if (result == "") {
        User.findById(req.params.id_user, function (error, usuario) {
          if (error) {
            res.status(404).send({ message: "not found" });
            return;
          }
          else if (usuario == null) {
            res.status(404).send({ usuario: "not found" });
            return;
          }
          else {
            res.status(200).send({user: usuario});
          }
        }).select('idUser name lname profile_pic');
      }
      else {
        res.status(200).send(result[0]);
      }
    });
  })


// NEWS FEED
router
  .route("/newsFeed")
  .post(async function (req, res) {
    var post = new newsFeed();
    if (req.body.idUser && req.body.message) { 
      post.idUser = req.body.idUser;
      post.message = req.body.message;
     
      try {
        await post.save(function (err) {
          if (err) {
            console.log(err);
            if (err.name == "ValidationError")
              res.status(400).send({ error: err.message });
              return;
          }
        });
        res.json({ mensaje: "Post creado" });
      } catch (error) {
        res.status(500).send({ error: error });
      }  
    }
    else {
      res.status(400).send({error: "missing fields"})
    }
  })
  .get(function (req, res) {
    newsFeed.aggregate([
                      {$lookup: 
                        {from: 'users',localField: 'idUser',
                        foreignField: '_id',
                        as: 'user'}
                      },
                      {$unwind: '$user' },
                      {$addFields : {
                        "time": { $dateToString: { format: "%d-%m-%Y %H:%M", date: "$_id", timezone: "America/Mexico_City"}}
                      }},
                      {$sort: {'_id': -1}},
                      {$project: 
                        {"time":1,
                        'user.name': 1,
                        'user.lname': 1,
                        'user.profile_pic': 1,
                        'message': 1}
                      }
                    ],function (err, result) {
      if (err) {
        res.send(err);
        return;
      }
      res.status(200).send(result);
    })
  });


// USERS
router
  .route("/users")
  .post(async function (req, res) {
    if (req.body.profile_pic && req.body.name && req.body.lname && req.body.dBirth && req.body.country && req.body.email && req.body.password) {
      var idUser;
      var user = new User();
      await User.findOne(async function (err, result) {
        if (err) {
          res.send(err);
          return;
        }
        else {
          idUser = parseInt(result._id)+1;
          user._id = idUser;

          await User.find({email: req.body.email}, async function (err, result) {
            console.log(result);
            if (result.length.length > 0 > 0) {
              res.status(400).send({error: "Email already exists"})
            }
            else if (err) {
              res.send(err);
            }
            else {
              user.profile_pic = req.body.profile_pic;
              user.name = req.body.name;
              user.lname = req.body.lname;
              user.dBirth = req.body.dBirth
              user.country = req.body.country;
              user.email = req.body.email;
              user.password =  passwordHash.generate(req.body.password);
              
              try {
                await user.save(function (err) {
                  if (err) {
                    console.log(err);
                    if (err.name == "ValidationError")
                      res.status(400).send({ error: err.message });
                  }
                  else{
                    res.json({ mensaje: "Usuario creado" });
                  }
                });
                
              } catch (error) {
                res.status(500).send({ error: error });
              }
            }
          })
        }
      }).sort('-_id')
    }
    else {
      res.status(400).send({error: "missing fields"})
    }
  
  })
  .get(function (req, res) {
    User.find({ }, function (err, usuarios) {
      if (err) {
        res.send(err);
        return;
      }
      res.status(200).send(usuarios);
    }).select('-password').sort({ _id: 1 })
  });

router
  .route("/users/:id_user")
  .get(function (req, res) {
    User.findById(req.params.id_user, function (error, usuario) {
      if (error) {
        res.status(404).send({ message: "not found" });
        return;
      }
      if (usuario == null) {
        res.status(404).send({ usuario: "not found" });
        return;
      }
      res.status(200).send(usuario);
    }).select('-password');
  })
  .put(function (req, res) {
    if (req.body.profile_pic && req.body.name && req.body.lname && req.body.dBirth && req.body.country && req.body.email) {
      User.findById(req.params.id_user, function (err, user) {
        if (err) {
          res.send(err);
          return;
        }
        user.profile_pic = req.body.profile_pic;
        user.name = req.body.name;
        user.lname = req.body.lname;
        user.dBirth = req.body.dBirth
        user.country = req.body.country;
        user.email = req.body.email;

        user.save(function (err) {
          if (err) {
            res.send(err);
            return;
          }
          res.json({ message: "usuario actualizado" });
        });
      });
    }
    else {
      res.status(400).send({error: "missing fields"})
    }
  })
  .delete(async function (req, res) {
    try {
      await productUser.deleteOne( { idUser: req.params.id_user}, function (err) {
        if (err) {
          console.log(err);
          if (err.name == "ValidationError")
            res.status(400).send({ error: err.message });
        }
        else {
          User.remove({_id: req.params.id_user},
            function (err) {
              if (err) {
                res.send(err);
                return;
              }
              res.json({ mensaje: "Usuario borrado con exito" });
            }
          );
        }
      });
    } catch (error) {
      res.status(500).send({ error: error });
    }
  });

// CARRITO
router
  .route("/carrito")
  .get(function (req, res) {
    Carrito.find({ }, function (err, carrito) {
      if (err) {
        res.send(err);
        return;
      }
      res.status(200).send(carrito);
    })
  });

router
  .route("/carrito/:id_user")
  .get(function (req, res) {
    Carrito.find({idUser: req.params.id_user}, function (error, carrito) {
      if (error) {
        res.status(404).send({ message: "not found" });
        return;
      }
      if (carrito == null) {
        res.status(404).send({ carrito: "not found" });
        return;
      }
      res.status(200).send(carrito);
    });
  })
  .post(async function (req, res) {
    console.log(req.body);
    if (req.body) {
      var product;
      Carrito.find({idUser: req.params.id_user, "products.idProd": req.body.idProd}, async function (err, producto) {
        console.log(producto)
        if (err) {
          res.send(err);
          return;
        }
        else if (producto != "") {
          res.status(400).send({message: "Producto ya en el carrito"})
          return;
        }
        else {
          await productUser.aggregate([{ $unwind: '$products' }, { $match: {'products.idProd': parseInt(req.body.idProd)}}, {'$limit': 1}, {$project: {'products':1, _id:0}}], function (err, producto) {
            if (err) {
              res.send(err);
              return;
            }
            else {
              console.log("producto[0].products" + producto[0].products);
              product = producto[0].products
            
              console.log("product: " + product);

              Carrito.findOneAndUpdate({idUser: req.params.id_user}, {$push: {products: product}}, async function (error, result) {
                if (error) {
                  res.status(404).send({ message: "not found" });
                  return;
                }
                if (result == null) {
                  var carrito = new Carrito();

                  carrito.idUser = req.params.id_user;
                  carrito.products = product;
                  try {
                    await carrito.save(function (err) {
                      if (err) {
                        console.log(err);
                        if (err.name == "ValidationError")
                          res.status(400).send({ error: err.message });
                      }
                      else{
                        res.json({ mensaje: "Producto agregado al carrito" });

                      }
                    });
                  } catch (error) {
                    res.status(500).send({ error: error });
                  }
                }
                else {
                  res.json({ mensaje: "Producto agregado al carrito" })
                }
              });
            }
              
          })
        }
      });
    }

    else {
      res.status(400).send({error: "missing fields"})
    }
    
  })
  .delete(function (req, res) {
    var idProd = parseInt(req.body.idProd);

    Carrito.updateOne({idUser: req.params.id_user}, {$pull: {products: {"idProd": idProd}}}, { "multi": false }, function (error, result) {
      console.log(result)
      if (error) {
        console.log(error)
        res.status(404).send({ message: "not found" });
        return;
      }
      if (result == null) {
        res.status(404).send({ result: "not found" });
        return;
      }
      else{
        res.json({ mensaje: "Producto eliminado del carrito" })
      }
    });
  });

// COMPRA
router
  .route("/compra")
  .get(function (req, res) {
    Compra.find({ }, function (err, compra) {
      if (err) {
        res.send(err);
        return;
      }
      res.status(200).send(compra);
    })
  });

router
  .route("/compra/:id_user")
  .get(function (req, res) {
    Compra.find({idUser: req.params.id_user}, function (error, compra) {
      if (error) {
        res.status(404).send({ message: "not found" });
        return;
      }
      else if (compra == null) {
        res.status(404).send({ compra: "not found" });
        return;
      }
      res.status(200).send(compra);
    }).sort('-_id');
  })
  .post(async function (req, res) {
      var productos;
      var compra = new Compra();
      await Carrito.find({idUser: req.params.id_user}, async function (err, carrito) {
        if (err) {
          res.send(err);
          return;
        }
        else {
        console.log(carrito)
        productos = carrito[0].products;

        productos.forEach(element => {
          var idProd = parseInt(element.idProd);

          productUser.updateOne({"products.idProd": idProd}, {$pull: {products: {"idProd": idProd}}}, async function (error, result) {
            if (error) {
              console.log(error)
              res.status(404).send({ message: "not found" });
              return;
            }
            if (result == null) {
              res.status(404).send({ result: "not found" });
              return;
            }
          });
        });
            compra.products = productos;
       
            compra.idUser = req.params.id_user;
            compra.address = req.body.address;

          try {
            await compra.save(function (err) {
              if (err) {
                console.log(err);
                if (err.name == "ValidationError")
                  res.status(400).send({ error: err.message });
              }
              else {
                Carrito.remove({idUser: req.params.id_user},
                  function (err) {
                    if (err) {
                      res.send(err);
                      return;
                    }
                    res.json({ mensaje: "Compra creada con exito" });
                  }
                );
              }
            });
          } catch (error) {
            res.status(500).send({ error: error });
          }  
      }
    })
  });

router
  .route("/validarCompra/:id_user")
  .put(function (req, res) {
    //if (req.body.validation) {
      Compra.findOne({idUser: req.params.id_user}, function (err, compra) {
        if (err) {
          res.send(err);
          return;
        }
        compra.validation = req.body.validation;
        if (req.body.comment != null) {
          compra.comment = req.body.comment;
        }

        compra.save(function (err) {
          if (err) {
            res.send(err);
            return;
          }
          res.json({ message: "Validacion de compra agregada" });
        });
      }).sort('-_id');
    //}
   /*  else {
      res.status(400).send({error: "missing fields"})
    } */
    
  });

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  next();
});
module.exports = router;
