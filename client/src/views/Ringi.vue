<template>
    <div>
        <NavBar/>
        <v-toolbar color="grey lighten-5" flat >
            <v-text-field
                append-icon="mdi-magnify"
                class="mt-3 mr-3"
                outlined dense single-line
                :label="$t('Search Customer Code')"
                v-model="search"
            ></v-text-field>
            <v-select
                class="mt-3"
                dense flat outlined
                :items="docStatus"
                label="Document Status"
                v-model="selectedStatus"
            ></v-select>

            <v-spacer></v-spacer>

            <v-btn v-if="userInfo.account_type === 'GC Leader'" @click="$router.push('CreateRingi')" class="mb-3" small rounded color="primary">
                <v-icon small class="mr-1">mdi-plus-circle-outline</v-icon> {{ $t('Create Ringi') }}
            </v-btn>

        </v-toolbar>
        <v-divider></v-divider>

        




        
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
export default {
    components:{
        NavBar,
    },
    data(){
        return{
            
        }
    },
    created(){
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name)
    }
}
</script>