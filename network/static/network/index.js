let logged_user;

document.addEventListener('DOMContentLoaded', function () {
    const log_user = document.querySelector('#logged-user strong');
    const username = document.querySelector('#username');
    const followBtn = document.querySelector('#follow');
    const fasIcons = document.querySelectorAll('.fas');
    const farIcons = document.querySelectorAll('.far');
    const editBtns = document.querySelectorAll('.edit-post-btn');

    if (log_user){
        logged_user = log_user.innerHTML;
        if(fasIcons){
            fasIcons.forEach(fasIcon => {
                fasIcon.addEventListener('click', () => like(fasIcon));
            });
        }
        if(farIcons){
            farIcons.forEach(farIcon => {
                farIcon.addEventListener('click', () => like(farIcon));
            });
        }
        if(username){
            if(followBtn){
                followBtn.addEventListener('click', () => follow(username.innerHTML));
            }
        }
        if(editBtns){
            editBtns.forEach(editBtn => {
                editBtn.addEventListener('click', () => edit(editBtn));
            })
        }
    }
});

function follow(username) {
    
    if(logged_user != username){
        fetch(`/follow/${username}`)
        .then(response => response.json())
        .then(user => {
            document.querySelector('#foll-numb').innerHTML = ''+user.followers.length;
            if (user.followers.includes(logged_user)){
                document.querySelector('#follow').innerHTML = "Unfollow";
            }
            else {
                document.querySelector('#follow').innerHTML = "Follow";
            }
        })
    }
    else {
        followBtn.style.display = 'none';
    }
}

function like(icon){
    const card = icon.closest(".card");
    fetch(`/like/${card.id}`)
    .then(response => response.json())
    .then(post => {
        (icon.className === "fas fa-thumbs-up")? icon.className = "far fa-thumbs-up" : icon.className = "fas fa-thumbs-up";
        icon.innerHTML=" "+post.likes;
    })
}

function edit(editButton){
    const card = editButton.closest(".card");
    const card_body = document.getElementById(`${card.id}`).getElementsByTagName('div')[1];
    const card_text = card_body.getElementsByTagName('p')[0];
    const card_btns = editButton.closest(".btns");
    const textarea = document.createElement("textarea");
    textarea.innerHTML = card_text.innerHTML;
    textarea.style.display = 'block';
    card_text.style.display = 'none';
    card_body.append(textarea);
    const saveButton = document.createElement('button');
    saveButton.innerHTML = 'Save';
    saveButton.className = 'post-save-btn btn-primary';
    saveButton.style.display = 'block';
    editButton.style.display = 'none';
    card_btns.append(saveButton);
    saveButton.addEventListener('click', () => {
        const new_content = textarea.value;
        fetch(`edit/${card.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                content: `${new_content}`
            })
        })
        .then (response => response.json())
        .then (success => {
            console.log(success);
            card_text.innerHTML = new_content;
        })
        .catch(error => {
            console.log(error);
        })

        card_text.style.display = 'block';
        textarea.style.display = 'none';
        editButton.style.display = 'block';
        saveButton.style.display = 'none';
    });
}