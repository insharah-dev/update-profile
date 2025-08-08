const projectUrl = 'https://nsvbxmhwoncpxmqfsdab.supabase.co';
const projectKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdmJ4bWh3b25jcHhtcWZzZGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMjQzOTAsImV4cCI6MjA2ODcwMDM5MH0.mVyqnlyV2cQx3laoXqxvHFpRcAwSsjvHvIbHTc9675A';
const { createClient } = supabase;
const client = createClient(projectUrl, projectKey)

console.log(createClient);
console.log(client);


const signupBtn = document.getElementById('signupBtn')

signupBtn && signupBtn.addEventListener('click', async () => {
    const full_name = document.getElementById('full_name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const profile_pic = document.getElementById('profile_pic').files[0]
    const fileEx = profile_pic.name.split('.')[1]

    console.log(fileEx);
    console.log(full_name, email, password, profile_pic);

    // authentication 

    if (email && password) {
        try {
            const { data, error: signupError } = await client.auth.signUp({
                email: email,
                password: password,
            })
            console.log(data);
            console.log(signupError);


            // get User 

            const { data: { user }, error
            } = await client.auth.getUser()
            console.log('get user data.........', user);
            console.log(user.id);

            console.log(error);


            if (data) {

                // profile store in bucket 

                const { data, error } = await client.storage.from('users-profiles')
                    .upload(`avatars/users-${user.id}.${fileEx}`, profile_pic, {
                        upsert: true,
                    })
                if (error) {
                    console.log(error);

                } else {
                    console.log('added a profile in bucket', data);

                    const { data: { publicUrl } } = client
                        .storage
                        .from('users-profiles')
                        .getPublicUrl(`avatars/users-${user.id}.${fileEx}`)

                    console.log('profile url............=>', publicUrl);

                    // other details store in database

                    const { error } = await client
                        .from('storage')
                        .insert({ user_id: user.id, email: email, full_name: full_name, profile_url: publicUrl })

                    if (error) {
                        console.log(error);
                    }
                    else {

                        window.location.href ="post.html"
                    }
                }

            }
        } catch (error) {
            console.log('signup error', error);
        }
    } else {
        if (email) {
            alert('please fill password feild')
        }
        else {
            alert('please fill email feild')
        }
    }

})


// profile fetch for post page 

if (window.location.pathname == '/post.html'|| window.location.pathname =='/profile-update/post.html') {
    const displayProfile = async () => {
        const { data: { user: { id: userId } }, error } = await client.auth.getUser()
        console.log(userId);
        console.log(error);

        if (userId) {
            const { data: [{ full_name, email, profile_url }], error } = await client.from('storage').select().eq('user_id', userId)

            if (profile_url) {
                const avatar = document.getElementById('avatar');
                if (avatar) {
                    avatar.src = profile_url;
                }

            } else {
                console.log(error);
            }

        } else {
            console.log('post page error=======>', error);
        }
    }

    displayProfile();
}

if (window.location.pathname == '/profile.html' || window.location.pathname =='/profile-update/post.html') {

    const profilepage = async () => {
        const { data: { user: { id: userId } }, error } = await client.auth.getUser()
        console.log(userId);
        console.log(error);

        if (userId) {
            const { data: [{ full_name, email, profile_url }], error } = await client.from('storage').select().eq('user_id', userId)

            if (profile_url) {
                const profile_pic_update = document.getElementById('profile_pic_update');
                profile_pic_update.src = profile_url;
            }
            if (full_name) {
                const fullname_ = document.getElementById('fullname_')
                fullname_.value = full_name;
            }
            if (email) {
                const profile_email = document.getElementById('profile_email')
                profile_email.value = email;
            }
        }
        else {
            console.log('post page error=======>', error);
        }
    }
    profilepage()
}

// profile pic delete

const deletPicture = document.getElementById('deletPicture')
deletPicture && deletPicture.addEventListener('click', async () => {
    const { data: { user }, error: userError } = await client.auth.getUser();
    console.log(user);
    console.log(userError);

    if (user) {
        // Get profile data from Supabase table
        const { data: { profile_url }, error: profileError } = await client
            .from('storage')
            .select('profile_url')
            .eq('user_id', user.id)
            .single();

        if (profile_url) {
            console.log('..............=>', profile_url);

            // Extract file extension from URL
            const urlParts = profile_url.split('.');
            const fileEx = urlParts[3]

            console.log(fileEx);

            const { data: deletedata, error: deleteError } = await client
                .storage
                .from('users-profiles')
                .remove([`avatars/users-${user.id}.${fileEx}`]);
            console.log(deletedata);

            console.log(deleteError);


            if (!deleteError) {
                const { data: [{ full_name, email, profile_url }], error } = await client.from('storage').select().eq('user_id', user.id)
                const profile_pic_update = document.getElementById('profile_pic_update');
                profile_pic_update.src = "https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg";



                const { data, error: { updateError } } = await client
                    .from('storage')
                    .update({ profile_url: "https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg" })
                    .eq('user_id', user.id);
                console.log(data);
                console.log(updateError);
            }

        } else {
            console.log('Profile URL not found', profileError);
        }
    }
});

const saveBtn = document.getElementById('saveBtn')
saveBtn && saveBtn.addEventListener('click', async () => {


    const fullname_ = document.getElementById('fullname_').value
    const profile_email = document.getElementById('profile_email').value

    const { data: { user }, error: userError
    } = await client.auth.getUser()
    console.log('get user data.........', user);
    console.log(user.id);
    console.log(userError);

    const { data, error } = await client
        .from('storage')
        .update({ full_name: fullname_, email: profile_email })
        .eq('user_id', user.id);
    console.log(data);
    console.log(error);

  window.location.href =  'post.html'
})

// update picture remaining
