<template>
    <div>
        <NavBar/>
        <v-toolbar dense flat>
            <v-col cols="2">
                <span class="overline">Date Created:</span> <br>
                <h5>{{recordToEdit.date_created}}</h5>
            </v-col>

            <v-col cols="2">
                <span class="overline">Created By:</span> <br>
                <h5>{{recordToEdit.created_by}}</h5>
            </v-col>

            <v-spacer></v-spacer>
            <v-btn  @click="updateRingiRecord()" icon ><v-icon color="primary">mdi-check-outline</v-icon></v-btn>
            <v-divider vertical inset></v-divider>
            <v-btn @click="$router.push('RingiPage'), $store.commit('FILE_INFO', {})" icon><v-icon color="error">mdi-close-outline</v-icon></v-btn>
        </v-toolbar>
        
        <div id="scroll-target" style="max-height: 528px;" class="overflow-y-auto">
            <v-form class="pa-2" v-on:scroll="scroll-target" >
            
                <h5 class="caption ml-5">*Empty fields are prohibited.Use (-) instead.</h5>
                <v-spacer></v-spacer>
                <v-row justify="end">
                    <v-col cols="3" style="margin:0px">
                        <v-menu v-model="receptionDateMenu" :close-on-content-click="false" max-width="290">
                            <template v-slot:activator="{ on }">
                                <v-text-field :value="computedDateForReceptionDate" label="Reception Date" readonly hint="MM/DD/YYYY"
                                persistent-hint outlined dense v-on="on"></v-text-field>
                            </template>
                            <v-date-picker no-title v-model="receptionDate" @change="receptionDateMenu = false"></v-date-picker>
                        </v-menu>
                    </v-col>

                    <v-col cols="2" class="ma-0 pa-0" style="margin:0px">
                        <small>Managerial Seal</small><br>
                        <v-img dense height="60" width="65" src="/seal.jpg" aspect-ratio="1" class="grey lighten-2 ml-4" v-model="recordToEdit.managerial_seal"></v-img>
                    </v-col>
                </v-row>
                
                <v-col cols="12">
                    <v-row>
                        <v-text-field class="mr-1" dense outlined label="Company Name" v-model="recordToEdit.company_name"></v-text-field>
                        <v-text-field class="mr-1" dense outlined label="Contact Number" v-model="recordToEdit.contact_number"></v-text-field>
                        <v-text-field class="mr-1" dense outlined label="Sales Representative" v-model="recordToEdit.sales_representative"></v-text-field>
                    </v-row>

                    <v-row>
                        <v-text-field class="mr-1" dense outlined label="Caller Name" v-model="recordToEdit.caller_name"></v-text-field>

                        <v-text-field class="mr-1" outlined dense label="Customer Code" v-model="recordToEdit.document_id"></v-text-field>
                       
                        <v-text-field class="mr-1" dense outlined label="Customer First Name" v-model="recordToEdit.customer_first_name"></v-text-field>
 
                        <v-text-field dense outlined label="Customer Last Name" v-model="recordToEdit.customer_last_name"></v-text-field>
                    </v-row>

                    <v-row>
                        <v-select class="mr-1" dense :items="houseType" label="House Type" outlined v-model="recordToEdit.house_type"></v-select>

                        <v-menu v-model="orderDateMenu" :close-on-content-click="false" max-width="290">
                            <template v-slot:activator="{ on }">
                                <v-text-field  class="mr-1" :value="computedDateForOrderDate" label="Order Date" readonly hint="MM/DD/YYYY"
                                persistent-hint outlined dense v-on="on"></v-text-field>
                            </template>
                            <v-date-picker no-title v-model="orderDate" @change="orderDateMenu = false"></v-date-picker>
                        </v-menu>

                        <v-menu v-model="upperBuildingDateMenu" :close-on-content-click="false" max-width="290">
                            <template v-slot:activator="{ on }">
                                <v-text-field  class="mr-1" :value="computedDateForUpperBuildingDate" label="Upper Building Date" readonly hint="MM/DD/YYYY"
                                persistent-hint outlined dense v-on="on"></v-text-field>
                            </template>
                            <v-date-picker no-title v-model="upperBuildingDate" @change="upperBuildingDateMenu = false"></v-date-picker>
                        </v-menu>

                        <v-text-field dense outlined class="mr-1" label="Number Of Outgoing Calls" v-model="recordToEdit.number_of_outgoing_calls"></v-text-field>
                    
                    </v-row>

                    <small>Attachments</small>
                    <v-row>
                        <v-checkbox v-model="recordToEdit.attachments" multiple  small class="mt-2 pa-0" rows v-for="(item, i) in selectOption" color="primary" :key="i" :label="item.text" :value="item.text"></v-checkbox>
                    </v-row>

                    <v-row>
                        <v-text-field dense outlined class="pa-0 ma-0" label="Subject" v-model="recordToEdit.subject"></v-text-field>  

                        <v-file-input :disabled="enabledFileAttachment" show-size counter outlined dense class="mt-1" label="File Attachment" v-model="uploadObject" @change="getFile()"/> 

                    
                    </v-row>
                </v-col>

                <!-- <froala :tag="'textarea'" :config="config" v-model="content"></froala> -->
                <!-- <vue-editor :editorOptions="editorSettings" v-model="content"> </vue-editor> -->
                <small>Content:</small>
                <vue-editor id="editorHeight" v-model="recordToEdit.content"/>
            </v-form>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import NavBar from '@/components/NavBar.vue';
import { VueEditor } from "vue2-editor";
export default {
    components:{
        NavBar,
        VueEditor
    },
    data(){
        return{
            recordToEdit: {},
             upperBuildingDateMenu: false,
            upperBuildingDate: '',
            receptionDate: '',
            orderDate: '',
            orderDateMenu: false,
            receptionDateMenu: false,
            content:'',
            houseType:["夢の家","I-smart", "I-cube"],
            attachments: [],
            selectOption:[{text:"Plan View"},{text:"Elevation"},{text:"Layout Drawing"},{text:"Other (Solar Panel Layout Diagram)"}],
            // selectOption:[{text:"平面図"},{text:"立面図"},{text:"配置図"},{text:"そ他（太陽光パネル割付図)"}],     
        }
    },
    methods:{
       updateRingiRecord(){
           console.log(this.recordToEdit)
            let url = `${this.aws}updateRecord`
            this.axios.put(url, this.recordToEdit).then(res => {
                this.$toast.success(' ',res.data, this.notificationSystem.options.success)
                this.recordToEdit = {};
                this.$router.push('RingiPage')
            })
        },
    },
    created(){
        this.recordToEdit = this.fileInfo
        this.receptionDate = this.fileInfo.reception_date;
        this.orderDate = this.fileInfo.order_date;
        this.upperBuildingDate = this.fileInfo.upper_building_date
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name)
    },
    computed:{
        computedDateForReceptionDate () {
            return this.receptionDate ? moment(this.receptionDate).format('L') : ''
        },
        computedDateForUpperBuildingDate(){
            return this.upperBuildingDate ? moment(this.upperBuildingDate).format('L') : ''
        },
        computedDateForOrderDate(){
            return this.orderDate ? moment(this.orderDate).format('L') : ''
        }
    }
}
</script>