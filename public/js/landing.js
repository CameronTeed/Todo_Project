document.addEventListener('DOMContentLoaded', function() {

      // Add event listeners for each "Update Status!" button
  var updateButtons = document.querySelectorAll('.update-status-button');

  updateButtons.forEach(function(button) {
      button.addEventListener('click', function() {
          // Get the message ID from the data attribute
          var messageId = button.getAttribute('data-message-id');
          console.log(messageId)
          var messageState = document.getElementById(`value+${messageId}`).value;
          var id = document.getElementById('id').innerText;
          let idCleansed = id.toString().replace(/^Shareable ID:\s*/i, '');
          let messageData = {
            parentID: idCleansed,
            id: messageId,
            state: messageState,
          }
          fetch('/updateStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.replace(`/getPool?id=${idCleansed}`);
            // Add your logic here for handling the success response
        })
        .catch(error => {
            console.error('Error:', error);
            // Add your logic here for handling errors
        });
          // Perform actions based on the clicked button and message ID
          console.log('Update Status clicked for message ID:', messageId);

          
          // You can now use the messageId to update the status or perform other actions
      });
  });
    // Wait for the DOM to be fully loaded

    var addMessageButton = document.getElementById('addMessage');
  
    if (addMessageButton) {
        addMessageButton.addEventListener('click', function(event) {
          // Prevent the default form submission
          event.preventDefault();
            
          // Get the value from the input field
          let toDo = document.getElementById('toDo').value;
          let state = document.getElementById('state').value;
          let status = document.getElementById('status').value;
          let id = document.getElementById('id').innerText;
          let idCleansed = id.toString().replace(/^Shareable ID:\s*/i, '');
          
          console.log("toDo: " + toDo + " state: " + state + " status: " + status + " id: " + idCleansed)
          if (!toDo || !state || !status) {
              // The message is empty, do nothing
              alert("Please fill out all fields")
              return;
          } 
        let messageData = {
            id: idCleansed,
            toDo: toDo,
            state: state,
            status: status,
        }

        fetch('/addMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.replace(`/getPool?id=${idCleansed}`);
            // Add your logic here for handling the success response
        })
        .catch(error => {
            console.error('Error:', error);
            // Add your logic here for handling errors
        });
        
  
          // Perform actions with the message value (e.g., submit the form via AJAX)
  
          // Add your logic here to handle the "Add Group" button click
          // For example, you can submit the form via AJAX or perform other actions
      });
    }

        // Add event listeners for each "Update Status!" button
  var updateButtons = document.querySelectorAll('.update-delete-button');

  updateButtons.forEach(function(button) {
      button.addEventListener('click', function() {
          // Get the message ID from the data attribute
          var messageId = button.getAttribute('data-message-id');

          var id = document.getElementById('id').innerText;
          let idCleansed = id.toString().replace(/^Shareable ID:\s*/i, '');
          
          let messageData = {
            parentID: idCleansed,
            id: messageId,
          }
          fetch('/deleteMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.replace(`/getPool?id=${idCleansed}`);
            // Add your logic here for handling the success response
        })
        .catch(error => {
            console.error('Error:', error);
            // Add your logic here for handling errors
        });
          // Perform actions based on the clicked button and message ID
          console.log('Update Status clicked for message ID:', messageId);

          
          // You can now use the messageId to update the status or perform other actions
      });
  });
  });