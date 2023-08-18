document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit compose form
  document.querySelector("#compose-form").addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(singleEmail => {

        console.log(singleEmail);
        const newEmail = document.createElement('div');
        newEmail.style.border = '2px solid';
        newEmail.style.padding = '4px';        

        if (mailbox === 'inbox'){
          if (singleEmail.read === true){
           newEmail.style.backgroundColor = '#cccccc';
          }
          else {
            newEmail.style.backgroundColor = 'white';
          }
          newEmail.innerHTML = `<b>${singleEmail.sender}</b> ${singleEmail.subject} ${singleEmail.timestamp}`;
          document.querySelector('#emails-view').append(newEmail);  
        }

        else if (mailbox === 'sent'){
          newEmail.style.backgroundColor = 'white';
          newEmail.innerHTML = `<b>${singleEmail.recipients}</b> ${singleEmail.subject} ${singleEmail.timestamp}`;
          document.querySelector('#emails-view').append(newEmail);
        }
        else if (mailbox === 'archive'){
          newEmail.style.backgroundColor = 'white';
          newEmail.innerHTML = `<b>${singleEmail.recipients}</b> ${singleEmail.subject} ${singleEmail.timestamp}`;
          document.querySelector('#emails-view').append(newEmail);
        }

        // When click any email
        newEmail.addEventListener('click', () => {
          
          document.querySelector("#email").style.display = 'block';
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          
          fetch(`/emails/${singleEmail.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
          

          fetch(`/emails/${singleEmail.id}`)
          .then(response => response.json())
          .then(email => {
            // Print email
              console.log(email);
              
              document.querySelector('#from').innerHTML = `<b>From:</b> ${email.sender}`;
              document.querySelector('#to').innerHTML = `<b>To:</b> ${email.recipients}`;
              document.querySelector('#subject').innerHTML = `<b>Subject:</b> ${email.subject}`;
              document.querySelector('#timestamp').innerHTML = `<b>Timestamp:</b> ${email.timestamp}`;
              document.querySelector('#body').innerHTML = `${email.body}`;

              if (email.archived === true && mailbox === 'archive'){
                document.querySelector('#archive').innerHTML = 'Unarchive';
                document.querySelector('#archive').addEventListener('click', () => {
                  fetch(`emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                  })//fetch
                  load_mailbox('inbox');
                })//archive
              }
              else if (email.archived === false && mailbox === 'inbox'){
                document.querySelector('#archive').innerHTML = 'Archive';
                document.querySelector('#archive').addEventListener('click', () => {
                  fetch(`emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: true
                    })
                  })//fetch
                  load_mailbox('inbox');
                })//archive
              }//else
              else if (email.archived === false && mailbox === 'sent'){
                document.querySelector('#archive').style.visibility = 'hidden';
              }

              // REPLY Function
              document.querySelector('#reply').addEventListener('click', () => {
                document.querySelector('#emails-view').style.display = 'none';
                document.querySelector('#compose-view').style.display = 'block';
                document.querySelector('#email').style.display = 'none';

                document.querySelector('#compose-recipients').value = email.sender;
                document.querySelector('#compose-recipients').disabled = true;
                document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
                document.querySelector('#compose-body').value = `${email.timestamp} ${email.recipients} wrote: ${email.body}`;
              }); // reply

            });
        });
      });
  });
};


function send_email(event) {
  event.preventDefault();
 
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
};
