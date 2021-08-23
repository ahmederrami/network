document.addEventListener('DOMContentLoaded', function () {
    load_posts('all');
});

function load_posts(filter) {

    const our_div = document.querySelector('#all-posts');
    const logged_user = document.querySelector('#logged-user strong').innerHTML;

    fetch(`posts/${filter}`)
    .then(response => response.json())
    .then(posts => {

        posts.forEach(post => {
            console.log(post);
            // Create elements
            const div = document.createElement('div');
            div.className = 'hide post rounded';

            const anchor = document.createElement('a');
            anchor.href = `/user/${post.user}`;

            const username = document.createElement('div');
            username.innerHTML = post.user;
            username.className = 'post-username';

            const timestamp = document.createElement('div');
            timestamp.innerHTML = post.timestamp;
            timestamp.className = 'timestamp';

            const content = document.createElement('div');
            content.innerHTML = post.content;

            const textarea = document.createElement('textarea');
            textarea.innerHTML = content.innerHTML;
            textarea.style.display = 'none';

            if (post.user == logged_user) {
                const editButton = document.createElement('button');
                editButton.innerHTML = 'Edit';
                editButton.className = 'btn btn-primary';
                const saveButton = document.createElement('button');
                saveButton.innerHTML = 'Save';
                saveButton.className = 'btn btn-primary';
                saveButton.style.display = 'none';
                editButton.addEventListener('click', () => edit(content, textarea, editButton, saveButton, post.id));
                div.append(editButton);
                div.append(saveButton);
            }

            const icon = document.createElement('i');

            like_icon_classname(logged_user, post, icon);
            icon.innerHTML = ' '+post.liked_by.length; //.likes;
            icon.addEventListener('click', () => like(logged_user, post.id, icon));

            let hr=document.createElement('hr');
            anchor.append(username);
            div.append(anchor);
            div.append(content);
            div.append(textarea);
            div.append(icon);
            div.append(timestamp);
            div.appendChild(hr);
            our_div.append(div);
            // showPosts.push(div);
        })

        // if (filter === "all") {
        //     pagination('#all-posts', 'none');
        // } else {
        //     pagination('#user-posts', 'none');
        // }
    })
}



function edit(element, textarea, editButton, saveButton, post_id) {
    element.style.display = 'none';
    textarea.style.display = 'block';
    editButton.style.display = 'none';
    saveButton.style.display = 'block';

    saveButton.addEventListener('click', () => {

        const content = textarea.value;

        fetch(`edit/${post_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                content: `${content}`
            })
        }) //;
        .then (response => response.json())
        .then (success => {
            console.log(success);
            element.innerHTML = content;
        })
        .catch(error => {
            console.log(error);
        })

        element.style.display = 'block';
        textarea.style.display = 'none';
        editButton.style.display = 'block';
        saveButton.style.display = 'none';

    })
}

function like_icon_classname(logged_user, post, icon){
    if (post.liked_by.includes(logged_user)) {
        icon.className = 'fas fa-thumbs-up';
    }
    else {
        icon.className = 'far fa-thumbs-up';
    }
}

function like(logged_user, post_id, icon){

    fetch(`/edit/${post_id}`,{
        method: 'PUT',
        body: JSON.stringify({
            command:'like'
        })
    })
    .then(response => response.json())
    .then(post => {
        console.log(post);
        like_icon_classname(logged_user, post, icon);
        icon.innerHTML=' '+post.liked_by.length; //.likes;
    });
}

function follow(username, change) {
    fetch(`/user/${username}`, {
        method: 'PUT',
        body: JSON.stringify({
            follow: `${change}`
        })
      })
    .then(response => response.json())
    .then(info => {
        document.querySelector('#foll-numb').innerHTML = info.followers;

    })
}

function pagination(appendHere, action) {

    if (action === 'next'){
        firstIndex += 10;
    } else if (action === 'previous') {
        firstIndex -= 10
    }

    let lastIndex = firstIndex +10
    const previousPosts = document.querySelectorAll('.hide')

    if (firstIndex === 0) {
        document.querySelector('#previous').style.display = 'none';
    } else if (lastIndex >= showPosts.length) {
        document.querySelector('#next').style.display = 'none';

    } else {
        document.querySelector('#next').style.display = 'block';
        document.querySelector('#previous').style.display = 'block';
    }

    if (previousPosts) {
        previousPosts.forEach( post => {
            post.style.display = 'none';
        })
    }

    for (let i = firstIndex; (i < showPosts.length) && (i < lastIndex); i++) {
        showPosts[i].style.display = 'block';
        document.querySelector(appendHere).append(showPosts[i]);
    }
}