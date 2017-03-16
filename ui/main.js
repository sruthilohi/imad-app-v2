//console.log('Loaded!');
//console.log('Loaded!');
 //change the text of the main text div
//var element = document.getElementById('main-text'
//);
/* element.innerhtml='new value';
var img = document.getElementById('madi');
img.onclick = function(){
 img.style.marginleft ='100px';  
}; */
//counter code

/*var button = document.getElementById('counter');
//var counter=0;
button.onclick = function(){
    
    
   
   //create a request object
   
   var request = new XMLHttpRequest();
    
   // capture the response and store it in a variable
    request.onreadystatechange = function(){
        if (request.readyState === XMLHttpRequest.DONE){
            //take some action
            if (request.status === 200){
                 var counter = request.responseText;
                 //render the variable in the correct span
                // counter=counter+1;
                 var span = document.getElementById('count');
                 span.innerHTML = counter.toString();
          }
            
       }
        //not done yet
            };
    //make a request
    
   request.open('GET','http://sruthilohi.imad.hasura-app.io/counter', true);
    
      request.send(null);
    
    
};*/


function loadLoginForm(){
    var loginHtml = `
     <h3>login to unlock awesome features</h3>
     <input type = "text" id="username" placeholder="username"/>
     <input type = "password" id="password" />
     <br/><br/>
   <button type="button"  id="login_btn" class="btn btn-info">
    <span class="glyphicon glyphicon-user"></span>Login
  </button>
   <button type="button"  id="register_btn" class="btn btn-info">
    <span class="glyphicon "></span>Register
  </button>
       
       `;
     document.getElementById('login_area').innerHTML = loginHtml;  
   
   
   
     // Submit username/password to login
    var submit = document.getElementById('login_btn');
    submit.onclick = function () {
        // Create a request object
         var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
                request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  submit.value = 'Sucess!';
              } else if (request.status === 403) {
                  submit.value = 'Invalid credentials. Try again?';
              } else if (request.status === 500) {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              } else {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              }
             loadLogin();
          }  
          // Not done yet
        };
        
        // Make the request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        //console.log(username);
       // console.log(password);
        request.open('POST', '/login', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        submit.value = 'Logging in...';
        
    };
 var register = document.getElementById('register_btn');
    register.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              
             
              if (request.status === 200) {
                  alert('User created successfully');
                  register.value = 'Registered!';
                   ClearFields();
                 register.value = 'Register';
                 
              } else {
                  alert('Could not register the user');
                  register.value = 'Register';
                  ClearFields();
              }
          }
        };
        
        // Make the request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        console.log(username);
        console.log(password);
        request.open('POST', '/create-user', true);
        request.setRequestHeader('Content-Type', 'application/json');
        
        request.send(JSON.stringify({username: username, password: password}));  
        register.value = 'Registering...';
    
    };
     
     
}
function ClearFields() {

     document.getElementById('username').value = "";
     document.getElementById('password').value = "";
}
 
function loadarticles () {
    // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        
        
        if (request.readyState === XMLHttpRequest.DONE) {
            var articles = document.getElementById('articles');
            if (request.status === 200) {
                var content = '<ul>';
                
               var articleData = JSON.parse(this.responseText);
               for (var i=0; i< articleData.length ; i++){
                   content += `<li>
                    <a href="/articles/${articleData[i].title}"><h4>${articleData[i].heading}</h4></a>
                    (${articleData[i].date.split('T')[0]})</li>`;
                }
                content += "</ul>";
                articles.innerHTML = content;
            } else {
              articles.innerHTML = ('Ooops! could not load all articles');  
            }
        }
    };
    
    request.open('GET', '/get-articles', true);
    request.send(null);
} 
function loadLoggedInUser (username) {
    var loginArea = document.getElementById('login_area');
    loginArea.innerHTML = `
        <h3> Hi <i>${username}</i></h3>
        <a href="/logout"><h3>Logout</h3></a>
    `;
    var newArticle = document.getElementById('new_article');
    newArticle.innerHTML = `
         <div class="page-header">
         <strong><a  href="/article"><h3>New Article<h3></a></strong> 
         </div>
    `;
    
}


function loadLogin () {
    // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                loadLoggedInUser(this.responseText);
                
            } else {
                loadLoginForm();
            }
        }
    };
    
    request.open('GET', '/check-login', true);
    request.send(null);
}
loadLoginForm ();
loadarticles();
