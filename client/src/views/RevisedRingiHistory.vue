<template>
    <div>
        <NavBar/>
        <v-toolbar dense flat color="blue-grey lighten-5">
            <div>
                <v-toolbar-title>
                    <span class="title">{{ $t('File History') }}</span>
                    <span class="title mr-2"> {{fileInfo.document_id}}</span>
                
                </v-toolbar-title>
            </div>
            <v-spacer></v-spacer>
             <v-text-field class="mt-6" outlined dense v-model="search" :label="$t('Search...')" prepend-inner-icon="mdi-magnify"></v-text-field>
            <v-divider class="ma-2" inset vertical></v-divider>
            <v-btn @click="$router.push('RingiFullInformation')" text>{{ $t('Back') }}</v-btn>
        </v-toolbar>
        <v-divider color="grey"></v-divider>

        <v-data-table :headers="historyHeaders" :items="revisedRingiHistory" :search="search" height="515px" densefixed-header scrollable class="elevation-5">
            <template v-slot:item.actions="{ item }">
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-btn @click="viewRingiFullInformation(item)" icon class="mr-1" v-on="on" color="green darken-4">
                            <v-icon>
                                mdi-file-eye-outline
                            </v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('View Details') }}</span>
                </v-tooltip>
            </template>
        </v-data-table>






    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
export default {
    components:{
        NavBar
    },
    data(){
        return{
            search:'',
            revisedRingiHistory:[],
            historyHeaders:[
                { text: 'Customer Code', value: 'document_id', align: 'center' },
                { text: 'Status', align: 'center', value: 'document_status',sortable: false },
                { text: 'Creation Date', value: 'date_created', align: 'center' },
                { text: 'Subject', value: 'subject',align: 'center', sortable: false },
                { text: 'Actions', align: 'center', value: 'actions', sortable: false }]


        }
    },
    methods:{
        viewRingiFullInformation(item){
            this.$store.commit('FILE_INFO', item);
            this.$router.push('RingiFullInformation');
        },
        loadRingiHistory(){
            let docType = 'Ringi'
            let url = `${this.aws}getAllRecords/${docType}`;
            
            this.axios.get(url).then(res => {
              this.revisedRingiHistory = res.data.filter(rec => {
                return rec.is_deleted === false && rec.document_status === "History" && rec.document_id === this.fileInfo.customer_code
                  || rec.document_status === 'History' && rec.customer_code === this.fileInfo.customer_code
              })

               console.log(this.revisedRingiHistory)

            })
        }
    },
    created(){
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        this.loadRingiHistory();
    }
}
</script>