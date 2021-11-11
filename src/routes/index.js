const admin = require("firebase-admin");
var session;
// var serviceAccount = require(process.env.GOOGLE_APPLICATIONS_CREDENTIALS);

var serviceAcount = require("../../proyecte-gameshop-firebase-adminsdk-h9gjq-008f89859a.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAcount),
  databaseURL: 'https://proyecte-gameshop-default-rtdb.europe-west1.firebasedatabase.app/'
});
const db = admin.database();

const express = require("express");
const router = express.Router();
const user = { state: false, type: false };


function login(req, res, next) {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    next();
  }
}


function isLogged(req, res, next) {
  if (req.session.userId) {
    user.state = true;
  } else {
    user.state = false;
  }
  next();
}

function isAdmin(req, res, next) {
  if (req.body.user == "admin" && req.body.password == 1234) {
    user.type = true;
  } else {
    user.type = false;
  }
  next();
}
function backendperms(req, res, next) {
  if (user.type) {
    next();
  } else {
    res.render("login", {
      title: "no_admin",
      perms: {no_admin: true},
      user,
    });
  }
}



router.get("/",isLogged, (req, res) => {
  const obj1 = db.ref("productes").limitToLast(3).get();
  Promise.all([obj1]).then(([snapshot1]) => {
    data = snapshot1.val();
    res.render("home", {
      productes: data,
      title: "Home",
      active: { Home: true },
      user,
    });
  });
});



// Session

router.get("/login", isLogged, (req, res) => {
  res.render("login");
});

router.post("/login", isLogged, isAdmin, (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).send("Fill all the credentials");
  }
  if (user && password) {
    var query = db.ref("usuaris").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var user = childSnapshot.val().user;
        var pw = childSnapshot.val().password;
        if (req.body.user == "israel" && req.body.password == 1234) {
          req.session.userId = childSnapshot;
          res.redirect("/");
        } else if (user == req.body.user && pw == req.body.password) {
          req.session.userId = childSnapshot;
          res.redirect("/");
        }
        res.render("login", {
          title: "login_err", 
          err: { login_err: true },
        });
      });
    });
  }
});

router.get("/backend",login, isLogged, backendperms, (req, res) => {
  const obj1 = db.ref("productes").get();
  Promise.all([obj1]).then(([snapshot1]) => {
    data = snapshot1.val();
    res.render("backend", {
      title: "Productes",
      productes: data,
      user
     });

  });
});






router.get("/contacte", isLogged, (req, res) => {
  res.render("contacte", {
    title: "Contacte",
    active: { Contacte: true },
    user,
  });
});

router.get("/registrar", isLogged, (req, res) => {
  res.render("registrar", {
    active: { Contacte: true },
  });
});

router.post('/new_user',(req,res)=>{

  console.log(req.body);
  const newUser ={
    user: req.body.user,
    password: req.body.password
  };
  db.ref('usuaris').push(newUser);
  res.redirect('/login');
}) 

router.get("/quienes_somos", isLogged, (req, res) => {
  res.render("quienes_somos", {
    title: "Quienes Somos",
    active: { quienes_somos: true },
    user,
  });
});
router.get("/Soporte", isLogged, (req, res) => {
  res.render("Soporte", {
    title: "Soporte",
    active: { Soporte: true },
    user
  });
});

router.get("/Tienda", (req, res) => {
  db.ref('productes').once('value',(snapshot)=>{
    const data = snapshot.val()
    res.render("Tienda", {
      title: "Tienda",
      productes:data,
      active: { Tienda: true },
      user,
    });

  });

});




router.get("/anadir_producte", (req, res) => {
  console.log(req.body);
  res.render("anadir_producte", {
    title: "añadir_producte",
  });
});

router.post('/new_producte',(req,res)=>{

  console.log(req.body);
  const newProducte ={
    producte: req.body.producte,
    foto: req.body.foto,
    preu: req.body.preu,
    descripcio: req.body.descripcio
    
  };
  db.ref('productes').push(newProducte);
  res.redirect('/backend');
}) 

router.get('/delete-item/:id',(req,res)=>{
  db.ref('productes/'+ req.params.id).remove();
  res.redirect('/backend');
})
router.post("/logout",isLogged, function (req, res) {
  req.session.userId = null;
  user.type = false;
  res.send("ok");
});


module.exports = router;

