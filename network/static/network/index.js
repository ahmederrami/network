let log_user;
let logged_user;

document.addEventListener('DOMContentLoaded', function () {
    const all_posts = document.querySelector('#all-posts');
    const profile_posts = document.querySelector('#user-posts');
    const username = document.querySelector('#username');
    log_user = document.querySelector('#logged-user strong');
    const followBtn = document.querySelector('#follow');
    const following_posts = document.querySelector('#users-posts');

    if (log_user){
        logged_user = log_user.innerHTML;
    }

    if (all_posts){
        var container = all_posts;
        load_posts('all', container);
    }
    if (username){
        var container = profile_posts;
        load_posts(username.innerHTML,container);
    }
    if (following_posts){
        var container = following_posts;
        load_posts('following',container);
    }

    if(followBtn){
        followBtn.addEventListener('click', () => follow(username.innerHTML));
    }    
});

function load_posts(filter, container) { 
    console.log(`posts/${filter}`);
    fetch(`posts/${filter}`)
    .then(response => response.json())
    .then(posts => {
        console.log(`posts/${filter}`);
        posts.forEach(post => {
            console.log(post);
            // Create elements
            const div = document.createElement('div');
            div.className = 'hide post rounded';

            const anchor = document.createElement('a');
            anchor.href = `${post.owner}`;

            const username = document.createElement('div');
            username.innerHTML = post.owner;
            username.className = 'post-username';

            const timestamp = document.createElement('div');
            timestamp.innerHTML = post.timestamp;
            timestamp.className = 'timestamp';

            const content = document.createElement('div');
            content.innerHTML = post.content;

            const textarea = document.createElement('textarea');
            textarea.innerHTML = content.innerHTML;
            textarea.style.display = 'none';

            if(log_user){
                if (post.owner == logged_user) {
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
            }

            const icon = document.createElement('i');
            icon.className = 'fas fa-thumbs-up';
            icon.innerHTML = ' '+post.liked_by.length;

            if(log_user){
                like_icon_classname(logged_user, post, icon);
                icon.addEventListener('click', () => like(logged_user, post.id, icon));
            }

            let hr=document.createElement('hr');
            anchor.append(username);
            div.append(anchor);
            div.append(content);
            div.append(textarea);
            div.append(icon);
            div.append(timestamp);
            div.appendChild(hr);
            container.append(div);
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

function follow(username) {
    if(log_user){
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
            console.log("can't follow themselves");
            followBtn.style.display = 'none';
        }
            
    }   
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