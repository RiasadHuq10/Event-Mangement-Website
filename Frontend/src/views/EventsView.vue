<script setup>
import { ref, onMounted, } from "vue"
import { useRoute } from "vue-router";// add watch
//import { ref, onMounted } from "vue";
import { jwtDecode } from "jwt-decode";

import { formatDistanceStrict } from 'date-fns'
const route = useRoute()


const events = ref([])
const totalPages = ref(0)
const total = ref(0)
const loading = ref(false)
let page = ref(1)
let perPage = ref(6)

const search = ref('')
const userType = ref('');
const userID = ref('');

const loadUser = async () => {
    try {
        // Get the token from local storage    
        const token = localStorage.getItem('token');
        // decode jwt token
        const decoded = jwtDecode(token);
        console.log(decoded);
        userType.value = `${decoded.type}`;
        userID.value = `${decoded._id}`

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
const getEvents = () => {

    console.log(search.value)
    const event = search.value || ''
    let params = [`page=${page.value}`, `perPage=${perPage.value}`]
    if (event) {
        params.push(`event=${event}`)
    }
    params = params.join('&')
    loading.value = true
    fetch(`/api/events?${params}`)
        .then((response) => response.json())
        .then((result) => {

            events.value = result.events
            total.value = result.total
            totalPages.value = Math.ceil(total.value / perPage.value)
            loading.value = false

        })
        .catch((error) => {

            totalPages.value = 0
            events.value = []
            loading.value = false
            throw error
        })
}

const joinEvent = async function (eventID) {
    var url = '/api/volEvent/' + eventID;
    var method = 'POST';

    // submit the event to the backend

    const token = localStorage.getItem('token');

    const response = await fetch(url, {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });
    // convert the response to json
    const json = await response.json();
    // log the json
    console.log(json);
    // alert the user
    alert(JSON.stringify(json));


}

const onPageChange = (p) => {
    page.value = p

    getEvents()

}
onMounted(() => {

    search.value = route.params.search
    loadUser()
    getEvents()

})

</script>

<template>
    <main>

        <div class="row my-4" style="margin: 20px;">

            <div class="col-6">

                <nav aria-label="breadcrumb ">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">
                            <RouterLink to="/">Home</RouterLink>
                        </li>

                        <li class="breadcrumb-item active" aria-current="page">
                            Events
                        </li>


                    </ol>
                </nav>
            </div>

            <form class="col-6 text-end" @submit.prevent="SubmitEvent"
                v-if="userType == 'admin' && route.name == 'all-events'">

                <button type="button" class="btn "
                    style="color: aliceblue;background-color: blue;margin-top: 5px; float: right; "
                    @click="$router.push('/event/create')">
                    New
                </button>
            </form>


        </div>

        <div class=".container " style="margin: 30px;">

            <div class="row">
                <div class="card col-12 col-md-12 col-lg-4" style="margin-top: 5px;" v-for="event in events"
                    :key="event._id">
                    <a :href="`/event/${event._id}`"><img :src="`${event.image}`" class="card-img-top"
                            onError="this.onerror=null;this.src='cardimg.png';" style="object-fit:fill;height: 300px;"></a>
                    <div class="card-body">
                        <h5 class="card-title">
                            {{ event.event }}
                        </h5>
                        <p class="card-text">
                            {{ event.description }}
                        </p>
                        <small class="text-muted">
                            Last updated

                            {{
                                formatDistanceStrict(new Date(event.modifiedAt), Date.now(), {
                                    addSuffix: true,
                                })
                            }}
                        </small>

                        <button type="button" class="btn" style="color: white; background-color: blue;margin-left: 10px; "
                            @click="$router.push('/event/' + event._id + '/edit')"
                            v-if="userType == 'admin' && route.name == 'all-events'">
                            Edit
                        </button>

                        <button type="button" class="btn" style="color: white; background-color: blue;margin-left: 10px; "
                            @click="joinEvent(event._id)" v-if="userType == 'volunteer' && route.name == 'all-events'">
                            Join
                        </button>

                    </div>

                </div>

            </div>

            <nav aria-label="Page navigation" style="margin:10px">
                <ul class="pagination">
                    <li class="page-item" v-for="i in Array.from({ length: totalPages }, (_, i) => i + 1)" :key="i">
                        <a class="page-link" @click="onPageChange(i)">
                            {{ i }}
                        </a>
                    </li>
                </ul>
            </nav>





        </div>




    </main>
</template>