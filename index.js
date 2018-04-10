var express = require("express");

var app 	= express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.set("views", "./views");

app.listen(3000);

var pg = require('pg');

var config = {
	user: 'justone',
	database: 'chucmunggiangsinh',
	password: '123',
	host: 'localhost',
	port: 5432,
	max: 10,
	idleTimeoutMillis: 30000,
};

var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var multer  = require('multer');
//storage cau hinh duong dan  noi ma file da upload len va ten file upload la gi.
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)  //originalname -> require .file luu dang file va dua ten vao file
  }
})

var upload = multer({ storage: storage }).single('uploadfile'); //uploadfile --> name="uploadfile" ben add.ejs


var pool = new pg.Pool(config);

app.get("/", function(req, res) {
	pool.connect(function (err, client, done) {
		if(err){
			return console.error('error client', err);
		}
		client.query('SELECT * FROM video', function (err, result) {
			done();
			if(err){
				res.end();
				return console.error("error runnung query", err);
			}
			res.render("home", {data:result});
		});
	});
})

app.get("/video/list", function (req, res) {
	pool.connect(function (err, client, done) {
		if(err){
			return console.error('error client', err);
		}
		client.query('SELECT * FROM video', function (err, result) {
			done();
			if(err){
				res.end();
				return console.error("error runnung query", err);
			}
			res.render("list", {data:result});
		});
	});
})

app.get("/video/delete/:id", function (req, res) {
	pool.connect(function (err, client, done) {
		if(err){
			return console.error('error client', err);
		}
		client.query('delete from video where id = '+req.params.id, function (err, result) {
			done();
			if(err){
				res.end();
				return console.error("error running query", err);
			}
			res.redirect("../list");
		});
	});
	// res.send(req.params.id); //xuat ra id
});


app.get("/video/add", function (req, res) {
	res.render("add");
});

app.post("/video/add",urlencodedParser, function(req, res){
	upload(req, res, function (err) {
    if (err) {
		res.send("error");
    }else{
    	if(req.file == undefined){
    		res.send("File chua duoc chon");
    	}else{
	    	pool.connect(function (err, client, done) {
			if(err){
				return console.error('error client', err);
			}
			var sql = "insert into video (tieude, mota, key, image) values ('"+req.body.tieude+"','"+req.body.mota+"','"+req.body.key+"','"+req.file.originalname+"')";
			client.query(sql, function (err, result) {
				done();
				if(err){
					res.end();
					return console.error("error running query", err);
				}
				res.redirect("/video/list");
			});
		});
    		// res.send("ok");
    		// console.log(req.file);
    		// console.log(req.body); // body parser (tieude , mota , key,....)

    	}

    }

  })

})
