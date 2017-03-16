 var submit = document.getElementById('article_btn');
    submit.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
                // Take some action
                if (request.status === 200) {
                    alert(' Article created sucessfully'); 
                } else {
                    alert('Error! Could not submit Article');
                }
                submit.value = 'Submit';
          }
        };
        
        // Make the request
        var title = document.getElementById('title').value;
         var heading = document.getElementById('heading').value;
          var content = document.getElementById('article_text').value;
        
        request.open('POST', '/submit-article', true);
        console.log(title);
          console.log(heading);
            console.log(article_text);
            console.log(new Date());
        request.setRequestHeader('Content-Type', 'application/json');
         
        request.send(JSON.stringify({title:title, heading:heading, content:content  }));  
       console.log(JSON.stringify({title:title, heading:heading, content:content  }));
        submit.value = 'Submitting...';
        
    };

