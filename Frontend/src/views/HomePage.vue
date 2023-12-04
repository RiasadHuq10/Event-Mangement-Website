<script setup>
import { ref, onMounted, watch } from "vue" // add watch
import { formatDistanceStrict } from 'date-fns'
//import { ref, onMounted } from "vue";
import { jwtDecode } from "jwt-decode";


const events = ref([]);
const highlightEvents = ref([]);
const total = ref(0);
const loading = ref(false);
const sortField = ref("modifiedAt");
const sortOrder = ref("desc");
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



        // convert the response to json
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
    const params = [

        `sort_by=${sortField.value}.${sortOrder.value}`,
    ].join("&");
    loading.value = true;
    fetch(`/api/events?${params}`)
        .then((response) => response.json())
        .then((result) => {

            events.value = result.events.slice(0, 3);
            loading.value = false;
        })
        .catch((error) => {
            events.value = [];
            total.value = 0;
            loading.value = false;
            throw error;
        });
};
const getHighlightEvents = () => {
    const params = [

        `sort_by=${sortField.value}.${sortOrder.value}`,
        `highlight=true` 
    ].join("&");
    loading.value = true;
    fetch(`/api/events?${params}`)
        .then((response) => response.json())
        .then((result) => {

            highlightEvents.value = result.events.slice(0, 3);
            loading.value = false;
        })
        .catch((error) => {
            events.value = [];
            total.value = 0;
            loading.value = false;
            throw error;
        });
};

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


onMounted(() => {
    getEvents();
    loadUser();
    getHighlightEvents()
});

const search = ref("");

watch(() => search.value, () => {
    getEvents();
});
</script>

<template>
    <main>
        <div id="carouselExampleIndicators" class="carousel slide container">
            <div class="carousel-indicators ">
                <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active"
                    aria-current="true" aria-label="Slide 1" ></button>
                <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"
                    aria-label="Slide 2"></button>
                <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2"
                    aria-label="Slide 3"></button>
            </div>
            <div class="carousel-inner ">
                <div class="carousel-item active"  v-for="event in highlightEvents">
                    <a :href="`/event/${event._id}`"><img :src="`${event.image}`" class="d-block w-100" alt="..." style="height: 600px;"></a>
                </div>
                
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators"
                data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators"
                data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
        <div class="row mb-3 .container " style="margin: 30px;">

            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">Recent</a>
                </li>
            </ul>
            <div class=" container " style="margin: 30px;">

                <div class="row">
                    <div class="card col-12 col-md-12 col-lg-4" style="margin-top: 0px;" v-for="event in events"
                        :key="event._id">
                        <a :href="`/event/${event._id}`"><img :src="`${event.image}`" class="card-img-top"
                                onError="this.onerror=null;this.src='cardimg.png';"
                                style="object-fit:fill;height: 300px;"></a>
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
                            <button type="button" class="btn"
                                style="color: white; background-color: blue;margin-left: 10px; "
                                @click="joinEvent(event._id)" v-if="userType == 'volunteer'">
                                Join
                            </button>


                        </div>

                    </div>





                </div>
            </div>
        </div>
    </main>
</template>
