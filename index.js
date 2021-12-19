const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

const conn = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'support' 
});

conn.connect(function(error) {
    if (error) {
        console.log(error);
        return;
    }
    else {
        console.log("Connection to Database --- OK");
    }
});

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render("main");
});

app.get('/user', (req, res) => {
  conn.query('SELECT id, username, phone, requests, responses FROM bd', (error, result) => {
	  res.render("user", { result: result });
  });
});

app.post('/user/requests', (req, res) => {
	conn.query("INSERT INTO bd(id, username, phone, requests, responses, executor_id) VALUES(?,?,?,?,?,?)", 
	['', req.body.username, req.body.phone, req.body.requests, '', ''], (error, result) => {
     res.redirect('/user');
  });
});

app.get('/boss', (req, res) => {
  conn.query('SELECT id, username, phone, requests FROM bd WHERE executor_id = 0', (error, result) => {
	  res.render("boss", { result: result });
  });
});

app.post('/boss/requests', (req, res) => {
	conn.query("UPDATE bd SET executor_id = ? WHERE bd.id = ?", ['1', req.body.requestsId], (error, result) => {
     res.redirect('/boss');
  });
});

app.get('/executor', (req, res) => {
  conn.query('SELECT id, username, phone, requests FROM bd WHERE executor_id = 1 AND responses = ?', '', (error, result) => {
	  res.render("executor", { result: result });
  });
});

app.post('/executor/responses', (req, res) => {
	conn.query("UPDATE bd SET responses = ? WHERE bd.id = ?", [req.body.responses, req.body.requestsId], (error, result) => {
     res.redirect('/executor');
	});
});

app.listen(3000, () => console.log('Сервер запущен на порте 3000'));