<script setup>
// imports
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";


const router = useRouter()

// credentials
const credentials = ref({
    email: '',
    password: ''
});

// methods
const login = async () => {
    try {
        // fetch
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials.value)
        });

        // response
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        // save token to local storage
        localStorage.setItem('token', data.token);
        location.assign('/')
    } catch (error) {
        alert(error);
    }
}
</script>
<template>
    <main>
        <div class="row">
            <div class="col-lg-3 col-md-2 col-sm-1"></div>
            <form @submit.prevent="login" class="col-lg-6 col-md-8 col-sm-10 ">

                <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">Email address</label>
                    <input type="email" class="form-control" v-model="credentials.email" aria-describedby="emailHelp">
                </div>
                <div class="mb-3">
                    <label for="exampleInputPassword1" class="form-label">Password</label>
                    <input type="password" class="form-control" v-model="credentials.password">
                </div>

                <button type="submit" class="btn btn-primary">Log in</button>
            </form>
            <div class="col-lg-3 col-md-2 col-sm-1"></div>
        </div>


    </main>
</template>
