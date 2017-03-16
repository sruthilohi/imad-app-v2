var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});


var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user: 'sruthilohi',
    database: 'sruthilohi',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};
var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30},
     resave: true,
     saveUninitialized: true 
}));


/* var articles= {
    
    'article-one': {
           title:'Article one  | sruthi', 
            heading:'Article one',
            date:'sep 1 2016',
          content: `        <p>
                          This is the content of my first article.This is the content of my first article.This is the content of my first article.This is the content of my first article.This is the content of my first article.This is the content of my first article.This is the content of my first article.
                    </p>
                    <p>
                          This is the content of my first article.This is the content of my first article.This is the content of my first article.This is the content of my first article.This is the content of my first article.This is the content of my first article.This is the content of my first article.
                    </p>`
        
                },
                
      'article-three': {
                title:'Article three  | sruthi', 
                 heading:'Article three',
                date:'sep 5 2016',
                 content: `        <p>
                            This is the content of my third article.
                     </p>
                     <p>
                            This is the content of my third article.first article.
                     </p>`
        },
        
        'article-two': {
                title:'Article two  | sruthi', 
                 heading:'Article two',
                date:'sep 2 2016',
                 content: ` <p>
                            This is the content of my second article.
                            </p>
                    `
        }
              
                
 
}; */


function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    
    var htmlTemplate = `
    <html>
      <head>
      
          <title>
              ${title}
          </title>
          <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge" >
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
          <link href="/ui/style.css" rel="stylesheet" />
        <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon"> 
      </head> 
      <body>
      <nav class="navbar navbar-inverse navbar-fixed-top">
          <div class="container-fluid">
            <div class="navbar-header">
                 <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>                        
      </button>
              <a class="navbar-brand" href="#">blog</a>
            </div>
            <div class="collapse navbar-collapse" id="myNavbar">
            <ul class="nav navbar-nav navbar-right">
              <li class="active"><a href="/">Home</a></li>
              <li><a href="#">Personal</a></li>
               <li class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#">Contact
                <span class="caret"></span></a>
                <ul class="dropdown-menu">
                  <li><a href="#">Twitter</a></li>
                </ul>
            </ul>
          </div>
          </div>
        </nav>
          <div class="container">
             
              <hr/>
              <h3>
                  ${heading}
              </h3>
              <div>
                  ${date.toDateString()}
              </div>
              <div class="well"> ${content}</div>
           
              <hr/>
              <h4>Comments</h4>
              <div id="comment_form">
              </div>
              <div id="comments">
                <center>Loading comments...</center>
              </div>
          </div>
          
         <script type="text/javascript" src="/ui/article.js">
        </script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
      </body>
      
    </html>
    `;
    return htmlTemplate;
}

var pool = new Pool(config);

function hash(input,salt) {
   //how do we create a hash 
    var hashed = crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$') ;
}
app.get('/hash/:input', function(req,res){
   var hashedstring = hash(req.params.input,'this-is-a-random-string');
   res.send(hashedstring);
});



app.post('/create-user', function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    if(!username.trim() || !password.trim() || username.length>32 || password.length>32){
           res.status(400).send("Username/password field can't be blank.Please Enter Username/Password:(Upto 32 chars)");   //Err if blank,tabs and space detected.
      }
       else if(!/^[a-zA-Z0-9_ .@]+$/.test(username)){  //If username contains other than a-z,A-Z,0-9,@._BLANKSPACE then send error.
    res.status(500).send("Username can't contain special characters except _.@");
        }
      else{
    var salt = crypto.randomBytes(128).toString('hex');
    var dbstring = hash(password, salt); 
    pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username,dbstring] , function(err,result){
        if(err){
        res.status(500).send(err.toString());
        
    }  else {
        res.send('user sucessfully created :' + username);
    } 
        
    });
     }
});
app.post('/login', function (req, res) {
   var username = req.body.username;
   var password = req.body.password;
    if(!username.trim() || !password.trim() || username.length>32 || password.length>32){
      res.status(400).send('Cannot leave username or password blank.Please Enter Username/Password:(Upto 32 chars)');
 }
 else if(!/^[a-zA-Z0-9_ .@]+$/.test(username)){  //If username contains other than a-z,A-Z,0-9,@._BLANKSPACE then send error.
    res.status(500).send("Username can't contain special characters except _.@");
}
else{
   pool.query('SELECT * FROM "user" WHERE username = $1', [username], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if (result.rows.length === 0) {
              res.status(403).send('username/password is invalid');
          } else {
              // Match the password
              var dbString = result.rows[0].password;
              var salt = dbString.split('$')[2];
              var hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
              if (hashedPassword === dbString) {
                
                // Set the session
                req.session.auth = {userId: result.rows[0].id};
                // set cookie with a session id
                // internally, on the server side, it maps the session id to an object
                // { auth: {userId }}
                
                res.send('credentials correct!');
                
              } else {
                res.status(403).send('username/password is invalid');
              }
          }
      }
     });
}
});
app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
      
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);    
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');
});


app.get('/get-articles', function (req, res) {
    
    //query article table
    //return a response with results
    
  
       pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(JSON.stringify(result.rows));   
           }
       });
});

app.get('/get-comments/:articleName', function (req, res) {
    
    //query article ,user and comment  table
    //return a response with * comments of a particular article
    // pool.query('SELECT comment.*, "user".username FROM article, comment, "user" WHERE article.title = $1 AND article.id = comment//.article_id AND comment.user_id = "user".id ORDER BY comment.timestamp DESC', [req.params.articleName], function (err, result) {
  
       pool.query('SELECT comment.*, "user".username FROM comment , "user", article WHERE article.title = $1 AND article.id = comment.article_id AND comment.user_id = "user".id ORDER BY comment.timestamp DESC', [req.params.articleName] , function (err, result) { console.log(result.rows);
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(JSON.stringify(result.rows));   
           }
       });
});



app.post('/submit-comment/:articleName', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        pool.query('SELECT * FROM article WHERE title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    // Now insert the right comment for this article
                    pool.query("INSERT INTO comment (comment, article_id, user_id) VALUES ($1, $2, $3)",
                        [req.body.comment, articleId, req.session.auth.userId], function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!');
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});

app.get('/test-db', function(req,res){
    
   //make a select request
    // return a response with result
  pool.query('SELECT * from test' , function(err,result){
    if(err){
        res.status(500).send(err.toString());
        
    }  else {
        res.send(JSON.stringify(result.rows));
    } 
   });
  
    
});
app.post('/submit-article', function(req,res){
 if (req.session && req.session.auth && req.session.auth.userId) {
    //var title = req.body.title;
   // var heading = req.body.heading;
   // var content= req.body.content;
    pool.query("INSERT INTO article (title, heading, date, content, author_id) VALUES ($1, $2, $3, $4, $5)", [ req.body.title, req.body.heading, new Date(),req.body.content, req.session.auth.userId ] , function(err,result){
        if(err){
        res.status(500).send(err.toString());
        
    }  else {
        res.send('Article sucessfully created ' );
    } 
        
    });
 } else {
        res.status(403).send('Only logged in users can comment');
    }
    
});

 app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

/*var counter=0;
app.get('/counter', function(req,res){
counter=counter+1;
res.send(counter.toString());
});
 app.get('/:articleName', function (req, res) {
    var articleName = rec.params.articleName;
    
  res.send(createtemplate(articles[articleName]));
}); */

app.get('/articles/:articleName', function(req,res){
    
    //articlename==article-one
    //articles[articlename]=={} content object for article-one
 // var articlename = req.params.articlename;
  pool.query('SELECT * from article where title = $1', [req.params.articleName], function (err, result) {
      
      if(err) {
          res.status(500).send(err.toString());
          
      } else {
          if(result.rows.length === 0){
              res.status(404).send('article not found');
           }else {
               var articleData = result.rows[0];
              // var articleId = result.rows[0].id;
                res.send( createTemplate(articleData));
           }
      }
  });
  
});
app.get('/article', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article.html'));
});

app.get('/journey', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'journeytrack.html'));
});



app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});


app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

 /*pool.query('INSERT INTO comments (comment, date, article-id ) VALUES ($1, $2, $3)', [req.body.comments, new Date(), articleId ],  function(err) {
    if (err) return onError(err);
});*/
/*pool.query('INSERT INTO comments ( comment, articleid ) VALUES ($1, $2)', [req.body.comments, articleId ],  function(err) {
    if (err) return onError(err);
});*/
var names = [];
app.get('/submit-name', function(req,res){  //submit-name?name=xxx
// get the name from the request
    var name = req.query.name;
    names.push(name);
    res.send(JSON.stringify(names));
    
});

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
