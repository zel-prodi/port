<template>
    <div>
        <navBar/>
        <v-toolbar flat dense>
            <v-row justify="start">
               <v-text-field
                dense
                outlined
                v-model="search"
                single-line
                class="mt-7"
                :label="$t('Search...')"
                prepend-inner-icon="mdi-magnify"
            ></v-text-field> 
            </v-row>
            
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>

            <v-btn v-if="userInfo.account_type === 'HRD Admin'" to="CreateTsuutatsu" rounded small color="primary"><v-icon small>mdi-plus-circle</v-icon>{{ $t('Create Tsuutatsu') }} </v-btn>
        </v-toolbar>

        <v-container grid-list-lg fluid class="pa-0 ma-0">
            <v-data-table
              :headers="computedHeaders"
              :items="computedTsuutatsuRecords"
              class="data-table ma-0 pa-0"
              pagination.sync="pagination"
              :loading="isLoading"
              :search="search"
              fixed-header
              dense
              height="460">

                <template v-slot:item.isNew="{ item }">
                <v-icon
                v-if="item.isNew === true"
                v-model="item.isNew"
                class="mr-2"
                color="primary"
                small
                >
                mdi-circle-slice-8
                </v-icon>

                <v-icon
                v-else
                class="mr-2"
                v-model="item.isNew"
                small
                >
                mdi-circle-outline
                </v-icon>
                </template>

                <template v-slot:item.confirmations="{ item }">
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn icon class="mr-2" v-on="on" @click="goToConfirmationPage(item)" color="blue-grey">
                                <v-icon>mdi-forum-outline</v-icon>
                            </v-btn>
                        </template>
                        
                        <span>{{ $t('Confirmations')}}</span>
                    </v-tooltip>
                </template>

                <template v-slot:item.action="{ item }">
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn icon class="mr-2" v-on="on" @click="viewTsuutatsuFullInformation(item)" color="teal darken-4" >
                                <v-icon >
                                    mdi-file-eye-outline
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('View Details') }}</span>
                    </v-tooltip>

                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn v-if="userInfo.account_type === 'HRD Admin'" icon class="mr-2" v-on="on" @click="goToEditTsuutatsuRecord(item)" color="primary">
                                <v-icon>
                                    mdi-pencil-outline
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Edit') }}</span>
                    </v-tooltip>

                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn v-if="userInfo.account_type === 'HRD Admin'" icon class="mr-2" v-on="on" @click="deleteTsuutatsuRecord(item)"  color="red">
                                <v-icon>
                                    mdi-trash-can-outline
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Delete') }}</span>
                    </v-tooltip>

                    <template v-if="userInfo.account_type === 'HRD Admin'">
                        <v-btn v-if="item.isSent === true" color="primary" 
                            x-small outlined rounded dense disabled
                            @click="confirmBeforeSendingTsuutatsuFile(item)">
                                <v-icon small>mdi-check</v-icon> Sent
                        </v-btn>

                        <v-btn v-else color="primary"    
                            x-small outlined rounded dense
                            @click="confirmBeforeSendingTsuutatsuFile(item)">
                            <v-icon small>mdi-send</v-icon> {{ $t('Send') }}
                        </v-btn>
                    </template>
                </template>

            </v-data-table>
        </v-container>

        <!-- DIALOGS -->
        <!-- CONFIRM BEFORE SENDING TSUUTATSU FILE -->
        <v-row justify="center">
            <v-dialog
                v-model="confirmBeforeSendingTsuutatsuDialog"
                max-width="500"
            >
                <v-card>
                    <v-card-title class="headline font-weight-light">
                        {{ $t('Confirmations') }}
                        <v-spacer></v-spacer>
                        <v-btn @click="confirmBeforeSendingTsuutatsuDialog = false" icon><v-icon>mdi-close</v-icon></v-btn>
                    </v-card-title>
                    <v-divider class="mr-2 ml-2"></v-divider><br>

                    <v-card-text class="font-weight-regular body-1">
                        {{ $t('Send this Tsuutatsu to GC Leaders?') }}<br>
                        {{ $t('This cannot be undone.') }}
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn
                        color="red darken-1"
                        text
                        @click="confirmBeforeSendingTsuutatsuDialog = false"
                        >
                        {{ $t(`Don't Send`) }}
                        </v-btn>

                        <v-btn
                        color="blue darken-1"
                        text
                        @click="sendTsuutatsuFile(), confirmBeforeSendingTsuutatsuDialog = false"
                        >
                            {{ $t('Send') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        
        <!-- SENDING EMAIL DIALOG -->
        <v-dialog
            v-model="sendingEmailDialog" 
            persistent :overlay="false"
            max-width="500px"
            transition="dialog-transition">
            
            <v-card color="#ECEFF1">
                <v-app-bar dense flat style="border-bottom:1px solid grey">
                    <v-icon color="primary">mdi-information-variant</v-icon>
                    <span class="font-weight-light title" style="margin-left:5px;">Information</span> 
                    <v-spacer></v-spacer>
                    <v-divider vertical></v-divider>
                    <v-btn @click="sendingEmailDialog = false" icon>
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-app-bar>
                <br>
                <v-card-text class="subtitle-1">

                    Sending Email Notification to GC Leaders. Please wait... 
                    <v-progress-linear
                        color="light-blue"
                        height="10"
                        striped
                        indeterminate
                    ></v-progress-linear>
                    <span class="#01579B--text caption">{{loadingrecipient}}</span>
                </v-card-text>
            </v-card>
        </v-dialog>
        
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';

export default {
    components: {
        NavBar
    },  
    data(){
        return{
            search: '',
            tsuutatsuRecords: [],
            headers: [
                {
                text: '', 
                align: 'left',
                sortable: false,
                value: 'isNew'
                },
                { text: 'Outgoing Date', value: 'outgoing_date'},
                { text: 'Orig. No.', value: 'original_number' , hidden:true},
                { text: 'Circular No.', value: 'document_id' },
                { text: 'Subject', value: 'subject', align: 'center'},
                { text: 'Q&A', value: 'confirmations',align: 'center', sortable: false},
                { text: 'Actions', align: 'center', value: 'action', sortable: false }
            ],
            isLoading: true,
            model: '',
            confirmBeforeSendingTsuutatsuDialog: false,
            GCEmails: [],
            GCLeaderAccountInfo: [],
            GCMemberCommonAccount: [],
            gcMemberAccountInfo:[],
            commonUsername: '',
            commonPassword: '',
            documentType: '',
            documentID: '',
            emailToSend: {},

            sendingEmailDialog: false,
            loadingrecipient: ``
        }
    },
    methods: {
        viewTsuutatsuFullInformation(item){
            console.log(item)
            this.$router.push('TsuutatsuFullInformation')
            this.$store.commit('FILE_INFO', item)
        },
        //METHOD FOR CONFIRMATION BEFORE SENDING THE TSUUTATSU FILE TO 9 GC LEADERS
        confirmBeforeSendingTsuutatsuFile(item){
            this.confirmBeforeSendingTsuutatsuDialog = true;
            this.toAdd = item
            this.documentType = item.document_type;
            this.documentID = item.document_id;
        },
        //METHOD FOR SENDING EMAIL NOTIFICATION
        //==================================================================================//
        // FOR IMPROVEMENT: Alert message for the leader accounts that has no common account assigned

        async sendTsuutatsuFile(){
            // // GET THE GC SUBGROUP OF GC LEADERS
            let leaderSubgroup = this.GCLeaderAccountInfo.map(rec => {
                return rec.gc_subgroup
            }).sort()

            //GET THE GC SUBGROUP OF GC MEMBERS(COMMON ACOCUNT)
            let memberSubgroup = this.GCMemberCommonAccount.map(rec => {
                return rec.gc_subgroup
            }).sort()

            // LOOP FOR SETTING THE EMAIL OPTIONS
            for(let i = 0; i<this.GCLeaderAccountInfo.length;i++){
                //IF THE COMMON ACCOUNT SUBGROUP MATCHES THE GC LEADER SUBGROUP, THEN ASSIN THE EMAIL BODY, SUBJECT, RECIPIENTS
                // AND THE COMMON ACCOUNT USERNAME AND PASSWORD BASED ON THE LEADERS GC SUBGROUP 
                //==================================================================================//
                // FOR IMPROVEMENT: Alert message for the leader accounts that has no common account assigned
                if(leaderSubgroup[i] === memberSubgroup[i]) {

                    //ASSIGNING OF COMMON ACCOUNT USERNAME THAT WILL BE USED ON EMAIL BODY
                    this.commonUsername = this.GCMemberCommonAccount.map(rec => {
                        return rec.username
                    })

                    //ASSIGNING OF COMMON ACCOUNT PASSWORD THAT WILL BE USED ON EMAIL BODY
                    this.commonPassword = this.GCMemberCommonAccount.map(rec => {
                        return rec.password
                    })
                    // console.log("===========COMMON ACCOUNT=========================")
                    // console.log("USERNAME: "+this.commonUsername[i] +"       "+"PASSWORD: "+ this.commonPassword[i])

                    //ASSIGNING OF EVERY GC LEADER EMAIL AS RECIPIENTS
                    let recipient = this.GCLeaderAccountInfo.map(rec=> {
                        return rec.email
                    })

                    this.emailToSend.recipient = recipient[i]

                    this.emailToSend.subject = `GC PORTAL NOTIFICATION - ${this.documentType} ${this.documentID}`;

                    this.emailToSend.body = `
                        New Tsuutatsu File Added by ${this.userInfo.email} 
                        <br><br> 
                        <p>Use this Login Credentials to Access the System:</p>
                        <p>
                        <b>USER NAME:</b> 
                        <p>${this.commonUsername[i]}</p> 
                        <b>PASSWORD:</b>  
                        <p>${this.commonPassword[i]}</p> 
                        <p>${this.gcPortalLink}</p>
                        <b>Thank You.<b/>
                    </p>`
                   
                }
                //METHOD THAT PROCESS THE EMAIL NOTIFICATION SENDING
                //IT WILL CONSOLE THE SENT EMAIL
                if(this.enableEmailNotif === true){
                    let url = `${this.aws}sendNotif`
                    await this.axios.post(url, this.emailToSend).then(res => {
                        console.log('send email',res.data)
                        this.sendingEmailDialog = true
                        this.loadingrecipient = this.emailToSend.recipient
                    })

                }

            }

            let url = `${this.aws}updateRecord`
            this.toAdd.isSent = true

            await this.axios.put(url, this.toAdd).then(() => {
                this.sendingEmailDialog = false
                this.$toast.success(' ','Tsuutatsu File Sent', this.notificationSystem.options.success)
            })


        },
        //METHOD FOR SOFT DELETING TSUUTATSU RECORD
        deleteTsuutatsuRecord(item){
            let toAdd = item
            toAdd.isDeleted = true
            let conf = confirm("DELETE this record?")
            if(conf === true){
                let url = `${this.aws}updateRecord`
                this.axios.put(url, toAdd).then(res => {
                console.log(res.data)
                // alert('Successfully Deleted')
                this.$toast.success(' ','Record Deleted', this.notificationSystem.options.success)
                this.loadTsuutatsuRecords();
                })
            }else{
                this.loadTsuutatsuRecords();
            }
        },
        goToConfirmationPage(item){
            this.$store.commit('FILE_INFO', item)
            this.$router.push('TsuutatsuConfirmationPage')
        },
        goToEditTsuutatsuRecord(item){
            console.log(item)
            this.$store.commit('FILE_INFO', item)

            this.$router.push('EditTsuutatsuPage')
        },
        loadTsuutatsuRecords(){
            this.isLoading = true;
            let docType = "Tsuutatsu"
            let url = `${this.aws}getAllRecords/${docType}`;
            this.axios.get(url).then(res => {
                this.tsuutatsuRecords = res.data.filter(rec => {
                return rec.isDeleted === false
                })
                this.isLoading = false
            })
        },
        loadGCEmails(){
            let company_group = 'GC'
            let url = `${this.aws}getAllUserByCompanyGroup/${company_group}`
            this.axios.get(url).then(res => {

                this.GCEmails = res.data

                this.GCLeaderAccountInfo = res.data.filter(rec => {
                    return rec.account_type === "GC Leader"
                })

                this.GCMemberCommonAccount = res.data.filter(rec => {
                    return rec.account_type === "GC Member"
                })

            })
        }
    },
    created(){
      this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
      this.loadTsuutatsuRecords();
      this.loadGCEmails();
    },
    computed:{
        computedHeaders() {
            if(this.userInfo.account_type === 'HRD Admin'){
                return this.headers
            }else{
                return [
                {
                    text: '', 
                    align: 'left',
                    sortable: false,
                    value: 'isNew'
                },
                { text: 'Outgoing Date', value: 'outgoing_date' },
                { text: 'Circular Number', value: 'document_id' },
                { text: 'Subject', value: 'subject', align: 'center'},
                { text: 'Q&A', value: 'confirmations',align: 'center', sortable: false },
                { text: 'Actions', align: 'center', value: 'action', sortable: false }
                ]
            }
        },
        computedTsuutatsuRecords(){
            if(this.userInfo.account_type === 'HRD Admin'){
                return this.tsuutatsuRecords.filter(rec => {
                    return rec.isDeleted === false
                })
            }else{
                return this.tsuutatsuRecords.filter(rec => {
                return rec.isDeleted === false && rec.isSent === true
                }) 
            }
        }
    }
}
</script>

<style>
    .data-table{
        border:1px solid grey;
    }
    
</style>