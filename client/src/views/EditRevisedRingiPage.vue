<template>
    <div>
        <NavBar/>
        <v-toolbar dense flat >
                <v-col cols="2">
                    <h4 class="overline">{{ $t('Customer Code') }}:</h4>
                    <h5>{{toAdd.document_id}}</h5>
                </v-col>

                <v-col cols="2">
                    <h4 class="overline">{{ $t('Date Created') }}:</h4>
                    <h5>{{toAdd.date_created}}</h5>
                </v-col>

                <v-col cols="3">
                    <h4 class="overline">{{ $t('Revised By') }}:</h4>
                    <h5>{{userInfo.email}}</h5>
                </v-col>

                <v-col cols="2">
                    <h4 class="overline">{{ $t('Date Revised') }}:</h4>
                    <h5>{{toAdd.date_revised}}</h5>
                </v-col>

                <!-- <v-col cols="2">
                    <h4 class="overline">{{ $t('Revision Number') }}:</h4>
                    <h5>{{toAdd.document_id}}</h5>
                </v-col> -->

            <v-spacer></v-spacer>
            <v-btn @click="saveRevisedRingi()" icon color="primary"><v-icon>mdi-check-outline</v-icon></v-btn>
            <v-divider inset vertical></v-divider>
            <v-btn @click="$router.push('RingiPage')" icon color="red"><v-icon>mdi-close-outline</v-icon></v-btn>
        </v-toolbar>
        <v-divider></v-divider>

         <v-container
            style="max-height: 520px; max-width:100%;"
            class="overflow-y-auto"> 
            <v-form v-on:scroll="scroll-target" >

                <!-- {{toAdd}} -->
            
                <h5 class="caption ml-5">{{ $t('*Empty fields are prohibited.Use (-) instead.') }}</h5>
                <v-spacer></v-spacer>
                <v-row style="margin-top:0" justify="end">
                    <v-col cols="2">
                        <h4 class="overline">{{ $t('Reception Date') }}:</h4>
                        <h5>{{toAdd.reception_date}}</h5>
                    </v-col>
                </v-row>
                
                <v-col cols="12">
                    <v-row>
                        <v-text-field class="mr-1" dense outlined :label="$t('Company Name')" v-model="toAdd.company_name"></v-text-field>
                        <v-text-field class="mr-1" dense outlined :label="$t('Contact Number')" v-model="toAdd.contact_number"></v-text-field>
                        <v-text-field class="mr-1" dense outlined :label="$t('Sales Representative')" v-model="toAdd.sales_representative"></v-text-field>
                    </v-row>

                    <v-row>
                        <v-text-field class="mr-1" dense outlined :label="$t('Caller Name')" v-model="toAdd.caller_name"></v-text-field>
                    
                        <v-text-field class="mr-1" dense outlined :label="$t('Customer First Name')" v-model="toAdd.customer_first_name"></v-text-field>
 
                        <v-text-field dense outlined :label="$t('Customer Last Name')" v-model="toAdd.customer_last_name"></v-text-field>
                    </v-row>

                    <v-row>
                        <v-select class="mr-1" dense :items="houseType" :label="$t('House Type')" outlined v-model="toAdd.house_type"></v-select>
                        <v-spacer></v-spacer>
                        <v-col style="margin:0; padding:0" cols="2" >
                            
                            <h4 class="overline">{{ $t('Order Date') }}:</h4>
                            <h5>{{toAdd.order_date}}</h5>
                        </v-col>

                        <v-col style="margin:0; padding:0" cols="2">
                            <h4 class="overline">{{ $t('Upper Building Date') }}:</h4>
                            <h5>{{toAdd.upper_building_date}}</h5>
                        </v-col>
                        <v-spacer></v-spacer>

                        <v-text-field dense outlined class="mr-1" :label="$t('Number Of Outgoing Calls')" v-model="toAdd.number_of_outgoing_calls"></v-text-field>
                    
                    </v-row>

                    <small>{{ $t('Attachments:') }}</small>
                    <v-row>
                        <v-checkbox v-model="toAdd.attachments" multiple  small class="mt-2 pa-0" rows v-for="(item, i) in selectOption" color="primary" :key="i" :label="item.text" :value="item.text"></v-checkbox>
                    </v-row>

                    <v-row>
                        <v-text-field dense outlined class="pa-0 ma-0" :label="$t('Subject')" v-model="toAdd.subject"></v-text-field> 

                        <v-file-input :disabled="enabledFileAttachment" show-size counter outlined dense class="mt-1" label="File Attachment" v-model="uploadObject" @change="getFile()"/> 
                    
                    </v-row>
                </v-col>
                <small>{{ $t('Content') }}:</small>
                <vue-editor id="editorHeight" v-model="toAdd.content"/>
            </v-form>
        </v-container>
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import {VueEditor} from "vue2-editor";
// import moment from 'moment';
export default {
    components: {
        NavBar,
        VueEditor
    },
    data(){
        return{
            houseType:["夢の家","I-smart", "I-cube"],
            attachments: [],
            selectOption:[{text:"Plan View"},{text:"Elevation"},{text:"Layout Drawing"},{text:"Other (Solar Panel Layout Diagram)"}],
            revNumber: '',
            toAdd: {},
            toUpdate: {},
            custCode: ''
        }
    },
    methods:{
        saveRevisedRingi(){
            let url = `${this.aws}addNewRecord`;
            this.axios.post(url, this.toAdd).then(res => {
                // alert(res.data)
                this.$toast.success(' ',res.data, this.notificationSystem.options.success)
            })
        }
    },
    created(){
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        ////PASS BY VALUE: same source, different value
        //TO CREATE NEW VALUE FOR SAVING REVISED FILE
        Object.assign(this.toAdd, this.fileInfo)
    }
}
</script>

<style>
  #editorHeight {
    height: 290px;
  }
</style>