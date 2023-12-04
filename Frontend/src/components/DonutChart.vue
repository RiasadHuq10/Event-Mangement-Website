<script setup>
import { ref, onMounted, defineProps } from "vue";

// const props = defineProps({
//     team: String,
// });
const token = localStorage.getItem('token');

const options = ref({});
const series = ref([]);

onMounted(async () => {
    var response = await fetch("/api/volEvent/organiser",
        {
            headers: {
                Authorization: `Bearer ${token}`,

            }
        });
    if (!response.ok) {

        alert(JSON.stringify("Unauthorised you are not a volunteer"));

    }
    var json = await response.json();
    options.value = {
        labels: json.map((item) => item._id),
    //     title: "Organisers"
    };
    series.value = json.map((item) => item.total);
});

</script>

<template>
    <div>
        <apexchart width="300" type="donut" :options="options" :series="series" />
    </div>
</template>