<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { jwtDecode } from "jwt-decode";
import router from './router';

const search = ref('')

const userType = ref('');

const logout = function () {
    location.assign('/')

    localStorage.removeItem('token');
    location.reload()

}

const loadUser = async () => {
    try {
        // Get the token from local storage    
        const token = localStorage.getItem('token');
        // decode jwt token
        const decoded = jwtDecode(token);
        console.log(decoded);
        userType.value = `${decoded.type}`;

        // Send a request to the endpoint with the token in the Authorization header



        // // convert the response to json
        // const json = await response.json();
        // // log the json
        // console.log(json);
        // // set the data
        // users.value = json;
    } catch (error) {
        console.log(error);
    }
};

onMounted(() => {
    loadUser();
});
</script>

<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <RouterLink class="navbar-brand" to="#">Navbar</RouterLink>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav  me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/events">Events </a>
                    </li>
                    <li class="nav-item" v-if="userType == ''">

                        <a class="nav-link" href="/become/volunteer">Become volunteer</a>

                    </li>
                    <li class="nav-item" v-if="userType == 'admin'">

                        <a class="nav-link" href="/volunteers">Volunteers</a>

                    </li>
                    <li class="nav-item" v-if="userType == 'volunteer'">

                        <a class="nav-link" href="/myevents">My Events</a>

                    </li>


                </ul>
                <form class="d-flex" role="search" @submit.prevent="() => { }">
                    <input type="search" class="form-control rounded" placeholder="Search" aria-label="Search"
                        aria-describedby="search-addon" v-model="search" />
                    <a type="button" class="btn btn-outline-primary" :href="`/events/${search}`">Search</a>
                    <div class="text-end" v-if="userType == ''">
                        <button type="submit" class="end-0 btn btn-primary " @click="$router.push('/login')"
                            style="margin-left: 5px;">Login</button>
                    </div>
                    <div class="text-end" v-if="userType != ''">
                        <button type="" class="end-0 btn btn-primary " @click="logout"
                            style="margin-left: 5px;">Logout</button>
                    </div>
                </form>

            </div>
        </div>
    </nav>

    <header>

    </header>

    <main>


    </main>
    <RouterView />
</template>
